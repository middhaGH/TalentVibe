from celery import Celery, group
import json
import hashlib
from threading import Lock
import concurrent.futures
import time

# --- Self-Contained Celery Application for Local Development ---
# This creates a Celery instance that runs tasks synchronously and in-memory.
# It does NOT require a message broker like Redis or RabbitMQ to be running.
celery_app = Celery(
    'tasks',
    broker_url=None,
    result_backend=None,
    task_always_eager=True,
    task_eager_propagates=True
)

# Global progress tracking
progress_lock = Lock()
job_progress = {}  # {job_id: {'completed': 0, 'total': 0, 'errors': 0}}

def process_single_resume(job_id, resume_data, job_description):
    """
    Process a single resume synchronously.
    This function is designed to be called in parallel.
    """
    from backend.app import app, db, Resume, emit_progress_update, check_job_completion
    from backend.ai_service import analyze_resume_with_ai
    
    with app.app_context():
        try:
            filename = resume_data['filename']
            file_content = resume_data['content']
            
            # Update progress - starting this resume
            with progress_lock:
                if job_id not in job_progress:
                    job_progress[job_id] = {'completed': 0, 'total': 0, 'errors': 0}
                current_progress = job_progress[job_id]
                current_progress['total'] = max(current_progress['total'], 1)
            
            emit_progress_update(job_id, f"Processing {filename}...", 'processing', current_progress)
            
            content_hash = hashlib.sha256(file_content.encode('utf-8')).hexdigest()
            existing_by_hash = Resume.query.filter_by(job_id=job_id, content_hash=content_hash).first()
            if existing_by_hash:
                with progress_lock:
                    job_progress[job_id]['completed'] += 1
                emit_progress_update(job_id, f"Skipped {filename}: Duplicate content", 'warning', job_progress[job_id])
                return {'status': 'skipped', 'reason': 'duplicate'}
            
            emit_progress_update(job_id, f"Analyzing {filename} with AI...", 'processing', job_progress[job_id])
            analysis_text = analyze_resume_with_ai(job_description, file_content)
            analysis_json = json.loads(analysis_text)
            
            candidate_name = analysis_json.get('candidate_name', 'Not Provided')
            if candidate_name.strip().lower() == 'name not found':
                candidate_name = 'Not Provided'

            new_resume = Resume(
                filename=filename,
                candidate_name=candidate_name,
                content=file_content,
                content_hash=content_hash,
                job_id=job_id,
                analysis=analysis_text
            )
            db.session.add(new_resume)
            db.session.commit()
            
            # Update progress - completed this resume
            with progress_lock:
                job_progress[job_id]['completed'] += 1
                current_progress = job_progress[job_id]
            
            emit_progress_update(job_id, f"Completed analysis for {filename}", 'success', current_progress)
            
            return {
                'status': 'success',
                'filename': filename,
                'candidate_name': candidate_name
            }
            
        except Exception as e:
            error_msg = f"Error processing {resume_data.get('filename', 'Unknown')}: {str(e)}"
            with progress_lock:
                job_progress[job_id]['errors'] += 1
                job_progress[job_id]['completed'] += 1
                current_progress = job_progress[job_id]
            emit_progress_update(job_id, error_msg, 'error', current_progress)
            # Do not retry, just return error
            return {'status': 'error', 'error': str(e)}

@celery_app.task
def process_job_resumes(job_id, resumes_data, job_description):
    """
    Processes multiple resumes for a job in parallel using ThreadPoolExecutor.
    This provides true parallel processing without requiring a message broker.
    """
    from backend.app import emit_progress_update

    total_resumes = len(resumes_data)
    
    # Initialize progress tracking for this job
    with progress_lock:
        job_progress[job_id] = {'completed': 0, 'total': total_resumes, 'errors': 0}
    
    emit_progress_update(job_id, f"Starting parallel processing of {total_resumes} resumes...", 'start', job_progress[job_id])
    
    # Use ThreadPoolExecutor for true parallel processing
    # Limit to 4 workers to avoid overwhelming the system and database
    max_workers = min(4, total_resumes)
    
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_resume = {
            executor.submit(process_single_resume, job_id, resume_data, job_description): resume_data
            for resume_data in resumes_data
        }
        
        # Collect results as they complete
        for future in concurrent.futures.as_completed(future_to_resume):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                results.append({'status': 'error', 'error': str(e)})
    
    # Final progress update
    with progress_lock:
        final_progress = job_progress[job_id]
    
    success_count = sum(1 for r in results if r and r.get('status') == 'success')
    error_count = final_progress['errors']
    
    emit_progress_update(job_id, f"Completed! {success_count}/{total_resumes} resumes processed successfully. {error_count} errors.", 'complete', final_progress)
    
    return {
        'status': 'completed',
        'job_id': job_id,
        'total_tasks': total_resumes,
        'successful': success_count,
        'errors': error_count
    } 