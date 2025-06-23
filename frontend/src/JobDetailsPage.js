import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import FeedbackModal from './components/FeedbackModal';
import InterviewModal from './components/InterviewModal';
import FitScoreModal from './components/FitScoreModal';
import './JobsPage.css';

const SkillMatrix = ({ skills }) => (
    <div className="skill-matrix">
        <div className="skill-column matches">
            <h4>✅ Matches ({skills.matches?.length || 0})</h4>
            <ul>
                {skills.matches?.map((skill, i) => <li key={`match-${i}`}>{skill}</li>)}
            </ul>
        </div>
        <div className="skill-column gaps">
            <h4>🚫 Gaps ({skills.gaps?.length || 0})</h4>
            <ul>
                {skills.gaps?.map((skill, i) => <li key={`gap-${i}`}>{skill}</li>)}
            </ul>
        </div>
    </div>
);

const Timeline = ({ timeline }) => (
    <div className="timeline">
        <h4>Timeline & Impact</h4>
        <ul>
            {timeline?.map((item, i) => (
                <li key={`timeline-${i}`}>
                    <strong>{item.period}:</strong> {item.role} - <em>{item.details}</em>
                </li>
            ))}
        </ul>
    </div>
);

const Logistics = ({ logistics }) => (
    <div className="logistics">
        <h4>Comp & Logistics</h4>
        <ul>
            <li><strong>Desired Comp:</strong> {logistics?.compensation || 'N/A'}</li>
            <li><strong>Notice Period:</strong> {logistics?.notice_period || 'N/A'}</li>
            <li><strong>Work Auth:</strong> {logistics?.work_authorization || 'N/A'}</li>
            <li><strong>Location:</strong> {logistics?.location || 'N/A'}</li>
        </ul>
    </div>
);

const JobDetailsPage = () => {
    const { jobId } = useParams();
    const [jobDetails, setJobDetails] = useState(null);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedResumeForFeedback, setSelectedResumeForFeedback] = useState(null);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [selectedResumeForInterview, setSelectedResumeForInterview] = useState(null);
    const [isFitScoreModalOpen, setIsFitScoreModalOpen] = useState(false);
    const [selectedResumeForFitScore, setSelectedResumeForFitScore] = useState(null);
    const detailsRef = useRef(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await fetch(`/api/jobs/${jobId}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setJobDetails(data);
            } catch (error) {
                setError(error.message);
                console.error(`Failed to fetch job details for job ${jobId}:`, error);
            } finally {
                setIsLoading(false);
            }
        };
        if (jobId) fetchJobDetails();
    }, [jobId]);

    const sortedResumes = useMemo(() => {
        if (!jobDetails?.resumes) return [];
        return [...jobDetails.resumes].sort((a, b) => (b.analysis?.fit_score || 0) - (a.analysis?.fit_score || 0));
    }, [jobDetails]);

    // Automatically select the top-ranked resume on initial load
    useEffect(() => {
        if (sortedResumes && sortedResumes.length > 0 && !selectedResumeId) {
            setSelectedResumeId(sortedResumes[0].id);
        }
    }, [sortedResumes, selectedResumeId]);

    const selectedResume = useMemo(() => {
        if (!selectedResumeId) return null;
        return sortedResumes.find(r => r.id === selectedResumeId);
    }, [selectedResumeId, sortedResumes]);

    // Scroll to details when a resume is selected
    useEffect(() => {
        if (selectedResumeId && detailsRef.current) {
            detailsRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [selectedResumeId]);

    const handleRowClick = (resumeId) => {
        const newId = selectedResumeId === resumeId ? null : resumeId;
        setSelectedResumeId(newId);
    };

    const handleFeedbackClick = (resume) => {
        setSelectedResumeForFeedback(resume);
        setIsFeedbackModalOpen(true);
    };

    const handleFeedbackSubmit = () => {
        // Refresh job details to show any updates
        window.location.reload();
    };

    const handleOverrideSubmit = (newBucket) => {
        // Update the local state to reflect the override
        if (selectedResumeForFeedback) {
            const updatedResume = {
                ...selectedResumeForFeedback,
                analysis: {
                    ...selectedResumeForFeedback.analysis,
                    bucket: newBucket
                }
            };
            setSelectedResumeForFeedback(updatedResume);
            
            // Update the job details
            setJobDetails(prev => ({
                ...prev,
                resumes: prev.resumes.map(r => 
                    r.id === selectedResumeForFeedback.id ? updatedResume : r
                )
            }));
        }
    };

    const handleInterviewClick = (resume) => {
        setSelectedResumeForInterview(resume);
        setIsInterviewModalOpen(true);
    };

    const handleInterviewCreated = (interviewId) => {
        // Optionally refresh the page or show a success message
        console.log('Interview created with ID:', interviewId);
        // You could also update the UI to show that an interview was scheduled
    };

    const getScoreClass = (score) => {
        if (score >= 90) return 'high';
        if (score >= 80) return 'medium-high';
        if (score >= 65) return 'medium';
        return 'low';
    };

    const getBucketClass = (bucket) => {
        if (!bucket) return 'default';
        const bucketName = bucket.toLowerCase().replace(/\s+/g, '-');
        return `bucket-${bucketName}`;
    };

    const handleFitScoreClick = (resume, event) => {
        event.stopPropagation(); // Prevent row selection
        setSelectedResumeForFitScore(resume);
        setIsFitScoreModalOpen(true);
    };

    if (isLoading) return <div className="job-details-container"><p>Loading job details...</p></div>;
    if (error) return <div className="job-details-container message error">Error: {error}</div>;
    if (!jobDetails) return <div className="job-details-container"><p>Job not found.</p></div>;

    return (
        <div className="job-details-container">
            <Link to="/jobs" className="back-link">← Back to All Jobs</Link>
            
            <div className="glass-container job-summary-card">
                <h2>Candidate Overview</h2>
                <div className="candidate-summary-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Candidate</th>
                                <th>Fit Score</th>
                                <th>Bucket</th>
                                <th>Key Skill Hits</th>
                                <th>Gaps / Flags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedResumes.map((resume, index) => (
                                <tr 
                                    key={resume.id} 
                                    onClick={() => handleRowClick(resume.id)}
                                    className={selectedResumeId === resume.id ? 'selected' : ''}
                                >
                                    <td><strong>{index + 1}</strong></td>
                                    <td>{resume.candidate_name || resume.filename}</td>
                                    <td>
                                        <span 
                                            className={`score-badge ${getScoreClass(resume.analysis?.fit_score)} clickable`}
                                            onClick={(e) => handleFitScoreClick(resume, e)}
                                            title="Click to view detailed breakdown"
                                        >
                                            {resume.analysis?.fit_score || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{resume.analysis?.bucket || 'N/A'}</td>
                                    <td>{resume.analysis?.skill_matrix?.matches?.join(', ') || 'N/A'}</td>
                                    <td>{resume.analysis?.skill_matrix?.gaps?.join(', ') || 'None'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedResume && (
                <div className="detailed-analysis-section" ref={detailsRef}>
                    <div key={selectedResume.id} className="glass-container detailed-resume-card">
                        <div className="detailed-resume-header">
                            <div>
                                <div className={`candidate-bucket-tag ${getBucketClass(selectedResume.analysis?.bucket)}`}>
                                    {selectedResume.analysis?.bucket || 'Pending'}
                                </div>
                                <h3 className="candidate-name">{selectedResume.candidate_name || selectedResume.filename}</h3>
                            </div>
                            <div className="header-actions">
                                <button 
                                    className="interview-button"
                                    onClick={() => handleInterviewClick(selectedResume)}
                                >
                                    📅 Schedule Interview
                                </button>
                                <button 
                                    className="feedback-button"
                                    onClick={() => handleFeedbackClick(selectedResume)}
                                >
                                    💬 Provide Feedback
                                </button>
                                <span className={`score-badge large ${getScoreClass(selectedResume.analysis?.fit_score)}`}>
                                    FIT SCORE: {selectedResume.analysis?.fit_score || 'N/A'} / 100
                                </span>
                            </div>
                        </div>
                        <p className="reasoning">{selectedResume.analysis?.reasoning}</p>
                        <div className="summary-points">
                            <h4>Summary</h4>
                            <ul>
                                {selectedResume.analysis?.summary_points?.map((point, i) => <li key={`sum-${i}`}>{point}</li>)}
                            </ul>
                        </div>
                        {selectedResume.analysis?.skill_matrix && <SkillMatrix skills={selectedResume.analysis.skill_matrix} />}
                        {selectedResume.analysis?.timeline && <Timeline timeline={selectedResume.analysis.timeline} />}
                        {selectedResume.analysis?.logistics && <Logistics logistics={selectedResume.analysis.logistics} />}
                    </div>
                </div>
            )}

            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                resume={selectedResumeForFeedback}
                onSubmitFeedback={handleFeedbackSubmit}
                onSubmitOverride={handleOverrideSubmit}
            />

            <InterviewModal
                isOpen={isInterviewModalOpen}
                onClose={() => setIsInterviewModalOpen(false)}
                resume={selectedResumeForInterview}
                jobId={jobId}
                onInterviewCreated={handleInterviewCreated}
            />

            <FitScoreModal
                isOpen={isFitScoreModalOpen}
                onClose={() => setIsFitScoreModalOpen(false)}
                resume={selectedResumeForFitScore}
            />
        </div>
    );
};

export default JobDetailsPage; 