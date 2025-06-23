import React from 'react';
import './FitScoreModal.css';

const FitScoreModal = ({ isOpen, onClose, resume }) => {
    if (!isOpen || !resume) return null;

    const analysis = resume.analysis || {};
    const scoreBreakdown = analysis.score_breakdown || {};
    
    const getScoreColor = (score) => {
        if (score >= 90) return '#22c55e'; // Green
        if (score >= 80) return '#3b82f6'; // Blue
        if (score >= 65) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getScoreClass = (score) => {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 65) return 'fair';
        return 'poor';
    };

    // New 7-criteria scoring system
    const criteriaConfig = [
        { key: 'skills_score', label: 'Skills & Qualifications', max: 40, weight: '40%' },
        { key: 'experience_score', label: 'Work Experience', max: 25, weight: '25%' },
        { key: 'leadership_score', label: 'Leadership & Impact', max: 10, weight: '10%' },
        { key: 'education_score', label: 'Education', max: 5, weight: '5%' },
        { key: 'certifications_score', label: 'Certifications & Training', max: 10, weight: '10%' },
        { key: 'resume_quality_score', label: 'Resume Quality & Extras', max: 5, weight: '5%' },
        { key: 'logistics_score', label: 'Logistics', max: 5, weight: '5%' }
    ];

    const hasNewScoreBreakdown = criteriaConfig.some(criteria => 
        scoreBreakdown[criteria.key] !== undefined
    );

    const hasOldScoreBreakdown = scoreBreakdown.skill_score !== undefined || 
                                scoreBreakdown.experience_score !== undefined || 
                                scoreBreakdown.logistics_score !== undefined;

    return (
        <div className="fit-score-modal-overlay" onClick={onClose}>
            <div className="fit-score-modal" onClick={(e) => e.stopPropagation()}>
                <div className="fit-score-modal-header">
                    <h2>Fit Score Breakdown</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="fit-score-modal-content">
                    <div className="candidate-info">
                        <h3>{resume.candidate_name || resume.filename}</h3>
                        <div className={`bucket-badge ${getScoreClass(analysis.fit_score)}`}>
                            {analysis.bucket || 'Pending Analysis'}
                        </div>
                    </div>

                    <div className="overall-score-section">
                        <div className="overall-score">
                            <div className="score-circle" style={{ borderColor: getScoreColor(analysis.fit_score) }}>
                                <span className="score-number">{analysis.fit_score || 'N/A'}</span>
                                <span className="score-max">/ 100</span>
                            </div>
                            <div className="score-label">Overall Fit Score</div>
                        </div>
                        <div className="reasoning-box">
                            <h4>AI Reasoning</h4>
                            <p>{analysis.reasoning || 'No reasoning provided'}</p>
                        </div>
                    </div>

                    {hasNewScoreBreakdown ? (
                        <div className="score-breakdown-section">
                            <h4>Weighted Score Breakdown</h4>
                            <div className="breakdown-grid">
                                {criteriaConfig.map((criteria, index) => (
                                    <div key={criteria.key} className="breakdown-item">
                                        <div className="breakdown-header">
                                            <div className="breakdown-label">{criteria.label}</div>
                                            <div className="breakdown-weight">({criteria.weight})</div>
                                        </div>
                                        <div className="breakdown-score">
                                            <span className="score-value">{scoreBreakdown[criteria.key] || 'N/A'}</span>
                                            <span className="score-max">/ {criteria.max}</span>
                                        </div>
                                        <div className="breakdown-bar">
                                            <div 
                                                className="breakdown-fill" 
                                                style={{ 
                                                    width: `${((scoreBreakdown[criteria.key] || 0) / criteria.max) * 100}%`,
                                                    backgroundColor: getScoreColor(scoreBreakdown[criteria.key] || 0)
                                                }}
                                            ></div>
                                        </div>
                                        {scoreBreakdown[`${criteria.key}_reasoning`] && (
                                            <div className="breakdown-reasoning">
                                                {scoreBreakdown[`${criteria.key}_reasoning`]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : hasOldScoreBreakdown ? (
                        <div className="score-breakdown-section">
                            <h4>Legacy Score Breakdown</h4>
                            <div className="breakdown-grid">
                                <div className="breakdown-item">
                                    <div className="breakdown-label">Skill Match</div>
                                    <div className="breakdown-score">
                                        <span className="score-value">{scoreBreakdown.skill_score || 'N/A'}</span>
                                        <span className="score-max">/ 50</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div 
                                            className="breakdown-fill" 
                                            style={{ 
                                                width: `${((scoreBreakdown.skill_score || 0) / 50) * 100}%`,
                                                backgroundColor: getScoreColor(scoreBreakdown.skill_score || 0)
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="breakdown-item">
                                    <div className="breakdown-label">Experience</div>
                                    <div className="breakdown-score">
                                        <span className="score-value">{scoreBreakdown.experience_score || 'N/A'}</span>
                                        <span className="score-max">/ 30</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div 
                                            className="breakdown-fill" 
                                            style={{ 
                                                width: `${((scoreBreakdown.experience_score || 0) / 30) * 100}%`,
                                                backgroundColor: getScoreColor(scoreBreakdown.experience_score || 0)
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="breakdown-item">
                                    <div className="breakdown-label">Logistics</div>
                                    <div className="breakdown-score">
                                        <span className="score-value">{scoreBreakdown.logistics_score || 'N/A'}</span>
                                        <span className="score-max">/ 20</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div 
                                            className="breakdown-fill" 
                                            style={{ 
                                                width: `${((scoreBreakdown.logistics_score || 0) / 20) * 100}%`,
                                                backgroundColor: getScoreColor(scoreBreakdown.logistics_score || 0)
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="score-breakdown-section">
                            <h4>Score Breakdown</h4>
                            <div className="no-breakdown-message">
                                <p>📊 Detailed score breakdown is not available for this analysis.</p>
                                <p>This resume was analyzed before the detailed scoring feature was implemented. 
                                New resume analyses will include a complete breakdown of all scoring criteria.</p>
                            </div>
                        </div>
                    )}

                    {analysis.skill_matrix && (
                        <div className="skill-analysis-section">
                            <h4>Skill Analysis</h4>
                            <div className="skill-matrices">
                                <div className="skill-column">
                                    <h5>✅ Matching Skills ({analysis.skill_matrix.matches?.length || 0})</h5>
                                    <div className="skill-tags">
                                        {analysis.skill_matrix.matches?.map((skill, i) => (
                                            <span key={`match-${i}`} className="skill-tag match">{skill}</span>
                                        )) || <span className="no-skills">No matching skills found</span>}
                                    </div>
                                </div>
                                <div className="skill-column">
                                    <h5>🚫 Skill Gaps ({analysis.skill_matrix.gaps?.length || 0})</h5>
                                    <div className="skill-tags">
                                        {analysis.skill_matrix.gaps?.map((skill, i) => (
                                            <span key={`gap-${i}`} className="skill-tag gap">{skill}</span>
                                        )) || <span className="no-skills">No skill gaps identified</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {analysis.timeline && analysis.timeline.length > 0 && (
                        <div className="timeline-section">
                            <h4>Career Timeline</h4>
                            <div className="timeline-items">
                                {analysis.timeline.map((item, i) => (
                                    <div key={`timeline-${i}`} className="timeline-item">
                                        <div className="timeline-period">{item.period}</div>
                                        <div className="timeline-content">
                                            <div className="timeline-role">{item.role}</div>
                                            <div className="timeline-details">{item.details}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysis.logistics && (
                        <div className="logistics-section">
                            <h4>Logistics & Availability</h4>
                            <div className="logistics-grid">
                                <div className="logistics-item">
                                    <span className="logistics-label">Work Authorization:</span>
                                    <span className="logistics-value">{analysis.logistics.work_authorization || 'Not specified'}</span>
                                </div>
                                <div className="logistics-item">
                                    <span className="logistics-label">Location:</span>
                                    <span className="logistics-value">{analysis.logistics.location || 'Not specified'}</span>
                                </div>
                                <div className="logistics-item">
                                    <span className="logistics-label">Notice Period:</span>
                                    <span className="logistics-value">{analysis.logistics.notice_period || 'Not specified'}</span>
                                </div>
                                <div className="logistics-item">
                                    <span className="logistics-label">Compensation:</span>
                                    <span className="logistics-value">{analysis.logistics.compensation || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {analysis.summary_points && analysis.summary_points.length > 0 && (
                        <div className="summary-section">
                            <h4>Key Insights</h4>
                            <ul className="summary-points">
                                {analysis.summary_points.map((point, i) => (
                                    <li key={`summary-${i}`}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FitScoreModal; 