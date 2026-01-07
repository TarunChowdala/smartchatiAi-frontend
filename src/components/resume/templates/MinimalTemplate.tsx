import React from 'react';
import type { ResumeData } from './ModernTemplate';

interface MinimalTemplateProps {
  data: ResumeData;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ data }) => {
  return (
    <div className="minimal-resume">
      <header className="minimal-header">
        <h1 className="minimal-name">{data.name}</h1>
        {data.title && <p className="minimal-title">{data.title}</p>}
        <p className="minimal-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.email && data.contact.phone && <span> | </span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {(data.contact.email || data.contact.phone) && data.contact.location && <span> | </span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </p>
      </header>

      {(data.summary || data.summaryHeadline || data.summaryHighlights) && (
        <section className="minimal-section">
          <h2 className="minimal-section-title">Professional Summary</h2>
          <div className="minimal-section-content">
            {data.summaryHighlights && data.summaryHighlights.length > 0 ? (
              <>
                {data.summaryHighlights.map((highlight, idx) => (
                  <p key={idx}>• {highlight}</p>
                ))}
              </>
            ) : data.summary ? (
              <p>{data.summary}</p>
            ) : null}
          </div>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section className="minimal-section">
          <h2 className="minimal-section-title">Experience</h2>
          <div className="minimal-section-content">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="minimal-experience-item">
                <div className="minimal-exp-header">
                  <p className="minimal-exp-role"><strong>{exp.role}</strong>, {exp.company}</p>
                  <p className="minimal-exp-company">
                    {exp.location && <span>{exp.location}</span>}
                    {exp.location && <span> | </span>}
                    <span>{exp.duration}</span>
                  </p>
                </div>
                <ul className="minimal-list">
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
        <section className="minimal-section">
          <h2 className="minimal-section-title">Projects</h2>
          <div className="minimal-section-content">
            {data.projects.map((project, idx) => (
              <div key={idx} className="minimal-project-item">
                <div className="minimal-project-header">
                  <p className="minimal-project-title"><strong>{project.title}</strong></p>
                </div>
                <ul className="minimal-list">
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
        <section className="minimal-section">
          <h2 className="minimal-section-title">Education</h2>
          <div className="minimal-section-content">
            {data.education.map((edu, idx) => (
              <div key={idx} className="minimal-education-item">
                <div className="minimal-exp-header">
                  <div>
                    <h3 className="minimal-edu-degree">{edu.degree}</h3>
                    <p className="minimal-edu-university">{edu.university}</p>
                  </div>
                  <span className="minimal-edu-duration">
                    {edu.duration}
                    {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills && (
        <section className="minimal-section">
          <h2 className="minimal-section-title">Skills</h2>
          <div className="minimal-section-content">
            {data.skills.frontend && data.skills.frontend.length > 0 && (
              <p>{data.skills.frontend.join(", ")}</p>
            )}
            {data.skills.backend && data.skills.backend.length > 0 && (
              <p>{data.skills.backend.join(", ")}</p>
            )}
            {data.skills.database && data.skills.database.length > 0 && (
              <p>{data.skills.database.join(", ")}</p>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <p>{data.skills.tools.join(", ")}</p>
            )}
            {data.skills.soft_skills && data.skills.soft_skills.length > 0 && (
              <p>{data.skills.soft_skills.join(", ")}</p>
            )}
          </div>
        </section>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <section className="minimal-section">
          <h2 className="minimal-section-title">Certifications</h2>
          <div className="minimal-section-content">
            <ul className="minimal-list">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {data.achievements && data.achievements.length > 0 && (
        <section className="minimal-section">
          <h2 className="minimal-section-title">Achievements</h2>
          <div className="minimal-section-content">
            <ul className="minimal-list">
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
