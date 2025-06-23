import os
from openai import OpenAI

# Global client instance, initialized to None.
_client = None

def get_client():
    """Initializes and returns the OpenAI client, creating it only if it doesn't exist."""
    global _client
    if _client is None:
        # This code will only run the first time get_client() is called.
        # By this time, the .env file will have been loaded by __main__.py.
        _client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return _client

def analyze_resume_with_ai(job_description, resume_text):
    """
    Analyzes a single resume against a job description using the OpenAI API,
    returning a rich, structured JSON analysis based on a detailed schema.
    """
    client = get_client()

    prompt = f"""
You are an expert talent acquisition specialist with a keen eye for technical and professional roles. 
Analyze the following resume against the provided job description and return a JSON object that strictly follows the specified schema.

**NEW WEIGHTED SCORING METHODOLOGY (7 Criteria):**

1. **Skills & Qualifications (40% - 40 points max)**
   - Excellent (36-40): All required skills with advanced proficiency + bonus skills
   - Strong (28-35): All required skills with good proficiency
   - Good (20-27): Most required skills, some gaps in advanced areas
   - Fair (12-19): Basic required skills, significant gaps
   - Poor (0-11): Missing critical required skills

2. **Work Experience (25% - 25 points max)**
   - Excellent (23-25): 8+ years relevant experience, senior roles, industry expertise
   - Strong (18-22): 5-7 years relevant experience, mid-level roles
   - Good (13-17): 3-4 years relevant experience, some relevant roles
   - Fair (8-12): 1-2 years relevant experience, entry-level roles
   - Poor (0-7): No relevant experience or very limited experience

3. **Leadership & Impact (10% - 10 points max)**
   - Excellent (9-10): Team leadership, project ownership, mentoring, strategic impact
   - Strong (7-8): Some leadership experience, project coordination
   - Good (5-6): Team collaboration, some project responsibility
   - Fair (3-4): Basic teamwork, limited leadership exposure
   - Poor (0-2): No leadership experience, individual contributor only

4. **Education (5% - 5 points max)**
   - Excellent (5): Advanced degree (Master's/PhD) in relevant field
   - Strong (4): Bachelor's degree in relevant field
   - Good (3): Bachelor's degree in related field
   - Fair (2): Associate's degree or some college
   - Poor (0-1): High school only or unrelated education

5. **Certifications & Training (10% - 10 points max)**
   - Excellent (9-10): Multiple relevant certifications, specialized training
   - Strong (7-8): Several relevant certifications
   - Good (5-6): Some relevant certifications or training
   - Fair (3-4): Basic certifications or limited training
   - Poor (0-2): No relevant certifications or training

6. **Resume Quality & Extras (5% - 5 points max)**
   - Excellent (5): Outstanding formatting, clear achievements, impressive extras
   - Strong (4): Good formatting, clear structure, some extras
   - Good (3): Acceptable formatting, basic structure
   - Fair (2): Poor formatting, unclear structure
   - Poor (0-1): Very poor formatting, difficult to read

7. **Logistics (5% - 5 points max)**
   - Excellent (5): Perfect alignment (location, authorization, notice period)
   - Strong (4): Good alignment with minor considerations
   - Good (3): Acceptable alignment with some flexibility
   - Fair (2): Some logistical challenges
   - Poor (0-1): Significant logistical barriers

**SCORING CALCULATION:**
- Score each category independently (0 to max points)
- Calculate weighted scores: (Category Score / Max Points) × Weight Percentage
- Final fit score = Sum of all weighted scores (max 100 points)

**BUCKET CLASSIFICATION:**
- 🚀 Green-Room Rocket (90-100): Exceptional candidates, immediate consideration
- ⚡ Book-the-Call (80-89): Strong candidates, schedule interview
- 🛠️ Bench Prospect (65-79): Potential candidates, consider for future roles
- 🗄️ Swipe-Left Archive (0-64): Not a fit, archive for future reference

**Output Schema:**
Your entire response MUST be a single JSON object. Do not include any text outside of this JSON.
The JSON must have the following structure:
{{
  "candidate_name": "The full name of the candidate as extracted from the resume. Make a best effort to find the name. If it is truly not available, return 'Name Not Found'.",
  "fit_score": "An integer from 0-100 representing the candidate's overall fit for the role (sum of all weighted component scores).",
  "score_breakdown": {{
    "skills_score": "An integer from 0-40 representing skills & qualifications score",
    "experience_score": "An integer from 0-25 representing work experience score",
    "leadership_score": "An integer from 0-10 representing leadership & impact score",
    "education_score": "An integer from 0-5 representing education score",
    "certifications_score": "An integer from 0-10 representing certifications & training score",
    "resume_quality_score": "An integer from 0-5 representing resume quality & extras score",
    "logistics_score": "An integer from 0-5 representing logistics score"
  }},
  "bucket": "A string categorizing the candidate. Choose from: '🚀 Green-Room Rocket' (90-100), '⚡ Book-the-Call' (80-89), '🛠️ Bench Prospect' (65-79), or '🗄️ Swipe-Left Archive' (0-64).",
  "reasoning": "A concise, one-sentence explanation for the assigned bucket and score.",
  "summary_points": ["An array of 2-3 string bullet points summarizing the candidate's key strengths and experiences relevant to the job."],
  "skill_matrix": {{
    "matches": ["An array of strings listing skills from the job description that the candidate demonstrably has."],
    "gaps": ["An array of strings listing critical skills from the job description that appear to be missing."]
  }},
  "timeline": [
    {{
      "period": "e.g., 2022-Now",
      "role": "e.g., Sr. ML Eng, Acme AI",
      "details": "A brief but impactful summary of their accomplishment in that role."
    }}
  ],
  "logistics": {{
    "compensation": "Extract desired compensation if available, otherwise 'Not specified'.",
    "notice_period": "Extract notice period if available, otherwise 'Not specified'.",
    "work_authorization": "Extract work authorization if available, otherwise 'Not specified'.",
    "location": "Extract current location or relocation preferences if available, otherwise 'Not specified'."
  }}
}}

---
**Job Description:**
{job_description}
---
**Resume:**
{resume_text}
---
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides analysis in a structured JSON format according to the user's schema."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred during AI analysis: {e}")
        error_response = {{
            "fit_score": 0,
            "score_breakdown": {{
                "skills_score": 0,
                "experience_score": 0,
                "leadership_score": 0,
                "education_score": 0,
                "certifications_score": 0,
                "resume_quality_score": 0,
                "logistics_score": 0
            }},
            "bucket": "Error",
            "reasoning": "An error occurred during analysis.",
            "summary_points": [],
            "skill_matrix": {{"matches": [], "gaps": []}},
            "timeline": [],
            "logistics": {{}}
        }}
        import json
        return json.dumps(error_response) 