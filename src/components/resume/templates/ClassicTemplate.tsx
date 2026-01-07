import React from 'react';
import type { ResumeData } from './ModernTemplate';

interface ClassicTemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
  return (
    <div className="classic-resume">
      <header className="classic-header">
        <h1 className="classic-name">{data.name}</h1>
        <p className="classic-title">
          {data.title && <span>{data.title}</span>}
          {data.title && data.contact.location && <span> • </span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </p>
        <p className="classic-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.email && data.contact.phone && <span> | </span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
        </p>
      </header>

      {(data.summary || data.summaryHeadline || data.summaryHighlights) && (
        <section className="classic-section">
          <h2 className="classic-section-title">Summary</h2>
          <div className="classic-section-content">
            {data.summaryHeadline && (
              <p className="classic-summary-headline">{data.summaryHeadline}</p>
            )}
            {data.summaryHighlights && data.summaryHighlights.length > 0 ? (
              <ul className="classic-list">
                {data.summaryHighlights.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            ) : data.summary ? (
              <p>{data.summary}</p>
            ) : null}
          </div>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-title">Experience</h2>
          <div className="classic-section-content">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="classic-experience-item">
                <div className="classic-exp-header">
                  <p className="classic-exp-role"><strong>{exp.role}</strong> — {exp.company}</p>
                  <p className="classic-exp-company">
                    {exp.location && <span>{exp.location}</span>}
                    {exp.location && <span> | </span>}
                    <span>{exp.duration}</span>
                  </p>
                </div>
                <ul className="classic-list">
                  {exp.details.map((detail, detailIdx) => (
                    <li key={detailIdx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.projects && data.projects.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-title">Key Projects</h2>
          <div className="classic-section-content">
            {data.projects.map((project, idx) => (
              <div key={idx} className="classic-project-item">
                <div className="classic-project-header">
                  <p className="classic-project-title"><strong>{project.title}</strong></p>
                </div>
                <ul className="classic-list">
                  {project.details.map((detail, detailIdx) => (
                    <li key={detailIdx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-title">Education</h2>
          <div className="classic-section-content">
            {data.education.map((edu, idx) => (
              <div key={idx} className="classic-education-item">
                <div className="classic-exp-header">
                  <div className="classic-exp-left">
                    <h3 className="classic-edu-degree">{edu.degree}</h3>
                    <p className="classic-edu-university">{edu.university}</p>
                  </div>
                  <span className="classic-edu-duration">
                    {edu.duration}
                    {edu.cgpa && ` • CGPA: ${edu.cgpa}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills && (
        <section className="classic-section">
          <h2 className="classic-section-title">Skills</h2>
          <div className="classic-section-content">
            <div className="classic-skills-grid">
              {data.skills.frontend && data.skills.frontend.length > 0 && (
                <div className="classic-skill-category">
                  <strong>Frontend Technologies:</strong> {data.skills.frontend.join(', ')}
                </div>
              )}
              {data.skills.backend && data.skills.backend.length > 0 && (
                <div className="classic-skill-category">
                  <strong>Backend Technologies:</strong> {data.skills.backend.join(', ')}
                </div>
              )}
              {data.skills.database && data.skills.database.length > 0 && (
                <div className="classic-skill-category">
                  <strong>Databases:</strong> {data.skills.database.join(', ')}
                </div>
              )}
              {data.skills.tools && data.skills.tools.length > 0 && (
                <div className="classic-skill-category">
                  <strong>Tools & Platforms:</strong> {data.skills.tools.join(', ')}
                </div>
              )}
              {data.skills.soft_skills && data.skills.soft_skills.length > 0 && (
                <div className="classic-skill-category">
                  <strong>Soft Skills:</strong> {data.skills.soft_skills.join(', ')}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-title">Certifications</h2>
          <div className="classic-section-content">
            <ul className="classic-list">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {data.achievements && data.achievements.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-title">Achievements</h2>
          <div className="classic-section-content">
            <ul className="classic-list">
              {data.achievements.map((achievement, idx) => (
                <li key={idx}>{achievement}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};
