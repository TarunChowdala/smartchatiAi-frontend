import React from 'react';

interface Contact {
  phone?: string;
  email?: string;
  location?: string;
}

interface Experience {
  role: string;
  company: string;
  location?: string;
  duration: string;
  details: string[];
}

interface Project {
  title: string;
  link?: string;
  details: string[];
}

interface Skills {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  tools?: string[];
  soft_skills?: string[];
}

interface Education {
  degree: string;
  university: string;
  duration: string;
  cgpa?: string;
}

export interface ResumeData {
  name: string;
  title?: string;
  contact: Contact;
  summary?: string;
  summaryHeadline?: string;
  summaryHighlights?: string[];
  experience: Experience[];
  projects?: Project[];
  skills?: Skills;
  education?: Education[];
  certifications?: string[];
  achievements?: string[];
}

interface ModernTemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  return (
    <div className="modern-resume">
      <header className="modern-header">
        <h1 className="modern-name">{data.name}</h1>
        <div className="modern-title">
          {data.title && <span>{data.title}</span>}
          {data.title && data.contact.location && <span> • </span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
        <div className="modern-contact">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.email && data.contact.phone && <span> | </span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
        </div>
      </header>

      {(data.summary || data.summaryHeadline || data.summaryHighlights) && (
        <section className="modern-section">
          <h2 className="modern-section-title">Summary</h2>
          <div className="modern-section-content">
            {data.summaryHeadline && (
              <p className="modern-summary-headline">{data.summaryHeadline}</p>
            )}
            {data.summaryHighlights && data.summaryHighlights.length > 0 ? (
              <ul className="modern-list">
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
        <section className="modern-section">
          <h2 className="modern-section-title">Experience</h2>
          <div className="modern-section-content">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="modern-experience-item">
                <div className="modern-exp-header">
                  <div className="modern-exp-role">{exp.role} — {exp.company}</div>
                  <div className="modern-exp-company">
                    {exp.location && <span>{exp.location}</span>}
                    {exp.location && <span> | </span>}
                    <span>{exp.duration}</span>
                  </div>
                </div>
                <ul className="modern-list">
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
        <section className="modern-section">
          <h2 className="modern-section-title">Projects</h2>
          <div className="modern-section-content">
            {data.projects.map((project, idx) => (
              <div key={idx} className="modern-project-item">
                <div className="modern-project-header">
                  <div className="modern-project-title">
                    {project.title}
                    {project.link && <span> ({project.link})</span>}
                  </div>
                </div>
                <ul className="modern-list">
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
        <section className="modern-section">
          <h2 className="modern-section-title">Education</h2>
          <div className="modern-section-content">
            {data.education.map((edu, idx) => (
              <div key={idx} className="modern-education-item">
                <div className="modern-exp-header">
                  <div className="modern-exp-left">
                    <h3 className="modern-edu-degree">{edu.degree}</h3>
                    <p className="modern-edu-university">{edu.university}</p>
                  </div>
                  <span className="modern-edu-duration">
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
        <section className="modern-section">
          <h2 className="modern-section-title">Skills</h2>
          <div className="modern-section-content">
            <div className="modern-skills-grid">
              {data.skills.frontend && data.skills.frontend.length > 0 && (
                <div className="modern-skill-category">
                  <strong>Frontend:</strong> {data.skills.frontend.join(', ')}
                </div>
              )}
              {data.skills.backend && data.skills.backend.length > 0 && (
                <div className="modern-skill-category">
                  <strong>Backend:</strong> {data.skills.backend.join(', ')}
                </div>
              )}
              {data.skills.database && data.skills.database.length > 0 && (
                <div className="modern-skill-category">
                  <strong>Database:</strong> {data.skills.database.join(', ')}
                </div>
              )}
              {data.skills.tools && data.skills.tools.length > 0 && (
                <div className="modern-skill-category">
                  <strong>Tools:</strong> {data.skills.tools.join(', ')}
                </div>
              )}
              {data.skills.soft_skills && data.skills.soft_skills.length > 0 && (
                <div className="modern-skill-category">
                  <strong>Soft Skills:</strong> {data.skills.soft_skills.join(', ')}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <section className="modern-section">
          <h2 className="modern-section-title">Certifications</h2>
          <div className="modern-section-content">
            <ul className="modern-list">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {data.achievements && data.achievements.length > 0 && (
        <section className="modern-section">
          <h2 className="modern-section-title">Achievements</h2>
          <div className="modern-section-content">
            <ul className="modern-list">
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
