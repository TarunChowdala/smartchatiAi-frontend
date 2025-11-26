import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Sparkles,
  Loader2,
  FileText,
  Search,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";
import api from "@/lib/api";
import html2pdf from "html2pdf.js";
import "./styles.css";

type AnalysisResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  matchScore: number;
  missingKeywords: string[];
  recommendedKeywords: string[];
};

// Resume JSON Data Types
type ResumeContact = {
  phone: string;
  email: string;
  location: string;
};

type ResumeExperience = {
  role: string;
  company: string;
  location: string;
  duration: string;
  details: string[];
};

type ResumeProject = {
  title: string;
  link?: string;
  details: string[];
};

type ResumeEducation = {
  degree: string;
  university: string;
  duration: string;
  cgpa?: string;
};

type ResumeSkills = {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  tools?: string[];
  soft_skills?: string[];
};

type ResumeData = {
  name: string;
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  skills: ResumeSkills;
};

// Template rendering functions
const renderResumeTemplate = (
  data: ResumeData,
  template: "modern" | "minimal" | "classic" | "creative"
): string => {
  switch (template) {
    case "modern":
      return renderModernTemplate(data);
    case "minimal":
      return renderMinimalTemplate(data);
    case "classic":
      return renderClassicTemplate(data);
    case "creative":
      return renderCreativeTemplate(data);
    default:
      return renderModernTemplate(data);
  }
};

const renderModernTemplate = (data: ResumeData): string => {
  const contactInfo = `${data.contact.phone} • ${data.contact.email} • ${data.contact.location}`;

  let html = `
    <div class="resume-header">
      <h1>${data.name}</h1>
      <div class="resume-contact">${contactInfo}</div>
    </div>
    
    <section class="resume-section">
      <h2>Professional Summary</h2>
      <p>${data.summary}</p>
    </section>
    
    <section class="resume-section">
      <h2>Professional Experience</h2>
  `;

  data.experience.forEach((exp) => {
    html += `
      <div class="resume-experience-item">
        <div class="exp-header">
          <strong>${exp.role}</strong>
          <span class="exp-duration">${exp.duration}</span>
        </div>
        <div class="exp-company">${exp.company}${
      exp.location ? ` • ${exp.location}` : ""
    }</div>
        <ul>
          ${exp.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
      </div>
    `;
  });

  html += `</section>`;

  if (data.projects && data.projects.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Projects</h2>
    `;
    data.projects.forEach((project) => {
      const projectLink =
        project.link && project.link.trim()
          ? project.link.startsWith("http")
            ? project.link
            : `https://${project.link}`
          : null;
      html += `
        <div class="resume-project-item">
          <div class="project-header">
            <strong>${project.title}</strong>
            ${
              projectLink
                ? ` <a href="${projectLink}" target="_blank" rel="noopener noreferrer">(${project.link})</a>`
                : ""
            }
          </div>
          <ul>
            ${project.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      `;
    });
    html += `</section>`;
  }

  if (data.education && data.education.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Education</h2>
    `;
    data.education.forEach((edu) => {
      html += `
        <div class="resume-education-item">
          <div class="exp-header">
            <div>
              <strong>${edu.degree}</strong>
              <div class="exp-company">${edu.university}</div>
            </div>
            <span class="exp-duration">${edu.duration}${
        edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ""
      }</span>
          </div>
        </div>
      `;
    });
    html += `</section>`;
  }

  if (data.skills) {
    html += `
      <section class="resume-section">
        <h2>Skills</h2>
        <div class="resume-skills-grid">
    `;

    if (data.skills.frontend && data.skills.frontend.length > 0) {
      html += `<div><strong>Frontend:</strong> ${data.skills.frontend.join(
        ", "
      )}</div>`;
    }
    if (data.skills.backend && data.skills.backend.length > 0) {
      html += `<div><strong>Backend:</strong> ${data.skills.backend.join(
        ", "
      )}</div>`;
    }
    if (data.skills.database && data.skills.database.length > 0) {
      html += `<div><strong>Database:</strong> ${data.skills.database.join(
        ", "
      )}</div>`;
    }
    if (data.skills.tools && data.skills.tools.length > 0) {
      html += `<div><strong>Tools:</strong> ${data.skills.tools.join(
        ", "
      )}</div>`;
    }
    if (data.skills.soft_skills && data.skills.soft_skills.length > 0) {
      html += `<div><strong>Soft Skills:</strong> ${data.skills.soft_skills.join(
        ", "
      )}</div>`;
    }

    html += `</div></section>`;
  }

  return html;
};

const renderMinimalTemplate = (data: ResumeData): string => {
  const contactInfo = `${data.contact.phone} | ${data.contact.email} | ${data.contact.location}`;

  let html = `
    <div class="resume-header">
      <h1>${data.name}</h1>
      <div class="resume-contact">${contactInfo}</div>
    </div>
    
    <section class="resume-section">
      <h2>Summary</h2>
      <p>${data.summary}</p>
    </section>
    
    <section class="resume-section">
      <h2>Experience</h2>
  `;

  data.experience.forEach((exp) => {
    html += `
      <div class="resume-experience-item">
        <div class="exp-header">
          <div>
            <strong>${exp.role}</strong>
            <div class="exp-company">${exp.company}${
      exp.location ? `, ${exp.location}` : ""
    }</div>
          </div>
          <span class="exp-duration">${exp.duration}</span>
        </div>
        <ul>
          ${exp.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
      </div>
    `;
  });

  html += `</section>`;

  if (data.projects && data.projects.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Projects</h2>
    `;
    data.projects.forEach((project) => {
      const projectLink =
        project.link && project.link.trim()
          ? project.link.startsWith("http")
            ? project.link
            : `https://${project.link}`
          : null;
      html += `
        <div class="resume-project-item">
          <div class="project-header">
            <strong>${project.title}</strong>
            ${
              projectLink
                ? ` <a href="${projectLink}" target="_blank" rel="noopener noreferrer">(${project.link})</a>`
                : ""
            }
          </div>
          <ul>
            ${project.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      `;
    });
    html += `</section>`;
  }

  if (data.education && data.education.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Education</h2>
    `;
    data.education.forEach((edu) => {
      html += `
        <div class="resume-education-item">
          <div class="exp-header">
            <div>
              <strong>${edu.degree}</strong>
              <div class="exp-company">${edu.university}</div>
            </div>
            <span class="exp-duration">${edu.duration}${
        edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ""
      }</span>
          </div>
        </div>
      `;
    });
    html += `</section>`;
  }

  if (data.skills) {
    html += `
      <section class="resume-section">
        <h2>Skills</h2>
        <div class="resume-skills-list">
    `;

    const allSkills: string[] = [];
    if (data.skills.frontend) allSkills.push(...data.skills.frontend);
    if (data.skills.backend) allSkills.push(...data.skills.backend);
    if (data.skills.database) allSkills.push(...data.skills.database);
    if (data.skills.tools) allSkills.push(...data.skills.tools);
    if (data.skills.soft_skills) allSkills.push(...data.skills.soft_skills);

    html += allSkills.join(" • ");
    html += `</div></section>`;
  }

  return html;
};

const renderClassicTemplate = (data: ResumeData): string => {
  const contactInfo = `${data.contact.phone} | ${data.contact.email} | ${data.contact.location}`;

  let html = `
    <div class="resume-header">
      <h1>${data.name}</h1>
      <div class="resume-contact">${contactInfo}</div>
    </div>
    
    <section class="resume-section">
      <h2>Professional Summary</h2>
      <p>${data.summary}</p>
    </section>
    
    <section class="resume-section">
      <h2>Professional Experience</h2>
  `;

  data.experience.forEach((exp) => {
    html += `
      <div class="resume-experience-item">
        <div class="exp-header">
          <strong>${exp.role}</strong>
          <span class="exp-duration">${exp.duration}</span>
        </div>
        <div class="exp-company">${exp.company}${
      exp.location ? ` • ${exp.location}` : ""
    }</div>
        <ul>
          ${exp.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
      </div>
    `;
  });

  html += `</section>`;

  if (data.projects && data.projects.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Key Projects</h2>
    `;
    data.projects.forEach((project) => {
      const projectLink =
        project.link && project.link.trim()
          ? project.link.startsWith("http")
            ? project.link
            : `https://${project.link}`
          : null;
      html += `
        <div class="resume-project-item">
          <div class="project-header">
            <strong>${project.title}</strong>
            ${
              projectLink
                ? ` <a href="${projectLink}" target="_blank" rel="noopener noreferrer">(${project.link})</a>`
                : ""
            }
          </div>
          <ul>
            ${project.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      `;
    });
    html += `</section>`;
  }

  if (data.education && data.education.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Education</h2>
    `;
    data.education.forEach((edu) => {
      html += `
        <div class="resume-education-item">
          <div class="exp-header">
            <div>
              <strong>${edu.degree}</strong>
              <div class="exp-company">${edu.university}</div>
            </div>
            <span class="exp-duration">${edu.duration}${
        edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ""
      }</span>
          </div>
        </div>
      `;
    });
    html += `</section>`;
  }

  if (data.skills) {
    html += `
      <section class="resume-section">
        <h2>Technical Skills</h2>
        <div class="resume-skills-columns">
    `;

    if (data.skills.frontend && data.skills.frontend.length > 0) {
      html += `<div><strong>Frontend Technologies:</strong> ${data.skills.frontend.join(
        ", "
      )}</div>`;
    }
    if (data.skills.backend && data.skills.backend.length > 0) {
      html += `<div><strong>Backend Technologies:</strong> ${data.skills.backend.join(
        ", "
      )}</div>`;
    }
    if (data.skills.database && data.skills.database.length > 0) {
      html += `<div><strong>Databases:</strong> ${data.skills.database.join(
        ", "
      )}</div>`;
    }
    if (data.skills.tools && data.skills.tools.length > 0) {
      html += `<div><strong>Tools & Platforms:</strong> ${data.skills.tools.join(
        ", "
      )}</div>`;
    }
    if (data.skills.soft_skills && data.skills.soft_skills.length > 0) {
      html += `<div><strong>Soft Skills:</strong> ${data.skills.soft_skills.join(
        ", "
      )}</div>`;
    }

    html += `</div></section>`;
  }

  return html;
};

const renderCreativeTemplate = (data: ResumeData): string => {
  const contactInfo = `${data.contact.phone} • ${data.contact.email} • ${data.contact.location}`;

  let html = `
    <div class="resume-header-creative">
      <h1>${data.name}</h1>
      <div class="resume-contact">${contactInfo}</div>
    </div>
    
    <div class="resume-content-wrapper">
      <div class="resume-left-column">
        <section class="resume-section">
          <h2>About</h2>
          <p>${data.summary}</p>
        </section>
        
        <section class="resume-section">
          <h2>Skills</h2>
    `;

  if (data.skills) {
    if (data.skills.frontend && data.skills.frontend.length > 0) {
      html += `<div class="skill-category"><strong>Frontend</strong><div class="skill-tags">${data.skills.frontend
        .map((s) => `<span class="skill-tag">${s}</span>`)
        .join("")}</div></div>`;
    }
    if (data.skills.backend && data.skills.backend.length > 0) {
      html += `<div class="skill-category"><strong>Backend</strong><div class="skill-tags">${data.skills.backend
        .map((s) => `<span class="skill-tag">${s}</span>`)
        .join("")}</div></div>`;
    }
    if (data.skills.database && data.skills.database.length > 0) {
      html += `<div class="skill-category"><strong>Database</strong><div class="skill-tags">${data.skills.database
        .map((s) => `<span class="skill-tag">${s}</span>`)
        .join("")}</div></div>`;
    }
    if (data.skills.tools && data.skills.tools.length > 0) {
      html += `<div class="skill-category"><strong>Tools</strong><div class="skill-tags">${data.skills.tools
        .map((s) => `<span class="skill-tag">${s}</span>`)
        .join("")}</div></div>`;
    }
    if (data.skills.soft_skills && data.skills.soft_skills.length > 0) {
      html += `<div class="skill-category"><strong>Soft Skills</strong><div class="skill-tags">${data.skills.soft_skills
        .map((s) => `<span class="skill-tag">${s}</span>`)
        .join("")}</div></div>`;
    }
  }

  html += `</section>`;

  if (data.education && data.education.length > 0) {
    html += `
        <section class="resume-section">
          <h2>Education</h2>
      `;
    data.education.forEach((edu) => {
      html += `
          <div class="resume-education-item">
            <strong>${edu.degree}</strong>
            <div class="exp-company">${edu.university}</div>
            <span class="edu-duration">${edu.duration}${
        edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ""
      }</span>
          </div>
        `;
    });
    html += `</section>`;
  }

  html += `</div><div class="resume-right-column">`;

  html += `
      <section class="resume-section">
        <h2>Professional Experience</h2>
    `;

  data.experience.forEach((exp) => {
    html += `
        <div class="resume-experience-item">
          <div class="exp-header">
            <strong>${exp.role}</strong>
            <span class="exp-duration">${exp.duration}</span>
          </div>
          <div class="exp-company">${exp.company}${
      exp.location ? ` • ${exp.location}` : ""
    }</div>
          <ul>
            ${exp.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      `;
  });

  html += `</section>`;

  if (data.projects && data.projects.length > 0) {
    html += `
      <section class="resume-section">
        <h2>Projects</h2>
    `;
    data.projects.forEach((project) => {
      const projectLink =
        project.link && project.link.trim()
          ? project.link.startsWith("http")
            ? project.link
            : `https://${project.link}`
          : null;
      html += `
        <div class="resume-project-item">
          <div class="project-header">
            <strong>${project.title}</strong>
            ${
              projectLink
                ? ` <a href="${projectLink}" target="_blank" rel="noopener noreferrer">(${project.link})</a>`
                : ""
            }
          </div>
          <ul>
            ${project.details.map((detail) => `<li>${detail}</li>`).join("")}
          </ul>
        </div>
      `;
    });
    html += `</section>`;
  }

  html += `</div></div>`;

  return html;
};

export default function ResumePage() {
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [showTemplate, setShowTemplate] = useState(false);
  const [aiGeneratedResumeHtml, setAiGeneratedResumeHtml] =
    useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "modern" | "minimal" | "classic" | "creative"
  >("modern");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeMode, setResumeMode] = useState<"jd_resume" | "enhance_resume">(
    "enhance_resume"
  );
  const [generatingResume, setGeneratingResume] = useState(false);
  const [showResumeView, setShowResumeView] = useState(false); // Track if we're in resume-only view

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedResume(file);
    } else if (file) {
      toast.error("Please upload a PDF file for your resume.", {
        duration: 2000,
      });
    }
  };

  const analyzeResume = async () => {
    if (!uploadedResume || !jobDescription.trim()) {
      toast.error("Please upload your resume and enter the job description.", {
        duration: 3000,
      });
      return;
    }
    if (uploadedResume && uploadedResume.type !== "application/pdf") {
      toast.error("Please upload a PDF file for your resume.", {
        duration: 3000,
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedResume);
      formData.append("job_description", JSON.stringify(jobDescription));

      const response = await api.post("/resume/compare-resume-jd", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutes timeout
      });

      // Validate response structure
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      const analysisData = response.data.analysis;
      if (!analysisData) {
        throw new Error("Analysis data not found in response");
      }

      if (response.data.resume_text) {
        localStorage.setItem("resume_text", response.data.resume_text);
      }
      if (response.data.job_description) {
        localStorage.setItem("jd", response.data.job_description);
      }

      // Parse analysis data safely
      let parsedResult;
      try {
        parsedResult =
          typeof analysisData === "string"
            ? JSON.parse(analysisData)
            : analysisData;
      } catch (parseError) {
        console.error("Failed to parse analysis data:", parseError);
        throw new Error("Failed to parse analysis results");
      }

      // Validate parsed result
      if (!parsedResult || typeof parsedResult !== "object") {
        throw new Error("Invalid analysis data format");
      }

      const transformedResult: AnalysisResult = {
        score: parsedResult.resumeScore || parsedResult.score || 75,
        strengths: Array.isArray(parsedResult.strengths)
          ? parsedResult.strengths
          : [],
        weaknesses: Array.isArray(parsedResult.improvements)
          ? parsedResult.improvements
          : Array.isArray(parsedResult.weaknesses)
          ? parsedResult.weaknesses
          : [],
        suggestions: Array.isArray(parsedResult.recommendations)
          ? parsedResult.recommendations
          : Array.isArray(parsedResult.suggestions)
          ? parsedResult.suggestions
          : [],
        keywords: Array.isArray(parsedResult.recommendedKeywords)
          ? parsedResult.recommendedKeywords
          : Array.isArray(parsedResult.keywords)
          ? parsedResult.keywords
          : [],
        matchScore: parsedResult.jobMatchScore || parsedResult.matchScore || 70,
        missingKeywords: Array.isArray(parsedResult.missingKeywords)
          ? parsedResult.missingKeywords
          : [],
        recommendedKeywords: Array.isArray(parsedResult.recommendedKeywords)
          ? parsedResult.recommendedKeywords
          : [],
      };

      // Small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Resume analysis completed successfully!", {
        duration: 3000,
      });

      setAnalysisResult(transformedResult);
    } catch (error: any) {
      console.error("Analysis error:", error);
      let errorMessage = "Failed to analyze resume. Please try again.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Request timed out. Please try again with a smaller file or check your connection.";
      } else if (error.response?.status === 413) {
        errorMessage = "File is too large. Please upload a smaller PDF file.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.detail ||
          "Invalid file format. Please upload a valid PDF file.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateResumeTemplate = async () => {
    // Validate required data
    const resumeText = localStorage.getItem("resume_text");
    if (!resumeText && resumeMode === "enhance_resume") {
      toast.error("Resume text not found. Please analyze your resume first.", {
        duration: 3000,
      });
      return;
    }

    if (!jobDescription.trim() && resumeMode === "jd_resume") {
      toast.error(
        "Job description is required for JD-based resume generation.",
        {
          duration: 3000,
        }
      );
      return;
    }

    try {
      setGeneratingResume(true);
      setShowTemplate(false); // Hide template during generation

      const response = await api.post(
        "/resume/generate-resume",
        {
          resume_type: resumeMode,
          resume_text: resumeText || "",
          job_description: jobDescription || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 180000, // 3 minutes timeout for generation
        }
      );

      // Validate response
      if (!response?.data) {
        throw new Error("Invalid response from server");
      }

      // Handle different response structures
      // The API might return the data in different formats:
      // 1. response.data (direct JSON object) - most common
      // 2. response.data.aiGeneratedResume (nested)
      // 3. response.data.resume (alternative nesting)
      // 4. response.data as string that needs parsing

      let resumeResponse: any = null;

      console.log("Full API response:", response.data);

      // First, check if the response data itself is the resume (direct JSON object)
      if (response.data && typeof response.data === "object") {
        // Check if response.data has the structure of a resume
        if (
          response.data.name &&
          response.data.contact &&
          typeof response.data.contact === "object" &&
          response.data.contact.phone &&
          response.data.contact.email
        ) {
          // Direct JSON object in response.data
          resumeResponse = response.data;
          console.log("✓ Found resume data directly in response.data");
        }
        // Check nested structures
        else if (response.data.aiGeneratedResume) {
          resumeResponse = response.data.aiGeneratedResume;
          console.log("✓ Found resume data in response.data.aiGeneratedResume");
        } else if (response.data.resume) {
          resumeResponse = response.data.resume;
          console.log("✓ Found resume data in response.data.resume");
        } else if (response.data.data) {
          // Sometimes API wraps in another data property
          resumeResponse = response.data.data;
          console.log("✓ Found resume data in response.data.data");
        }
      }

      if (!resumeResponse) {
        console.error(
          "❌ Could not find resume data in response. Response structure:",
          {
            keys: response.data ? Object.keys(response.data) : [],
            data: response.data,
          }
        );
        throw new Error(
          "Resume data not found in response. Please check the API response structure."
        );
      }

      // Check if response is JSON (object or string) or HTML
      let jsonData: ResumeData | null = null;

      // Check if it's already a valid ResumeData object
      if (typeof resumeResponse === "object" && resumeResponse !== null) {
        // Validate it has required fields
        if (
          resumeResponse.name &&
          resumeResponse.contact &&
          typeof resumeResponse.contact === "object" &&
          resumeResponse.contact.phone &&
          resumeResponse.contact.email
        ) {
          // It's a valid ResumeData object
          jsonData = resumeResponse as ResumeData;
          console.log("Successfully parsed JSON resume data:", {
            name: jsonData.name,
            hasExperience: Array.isArray(jsonData.experience),
            hasProjects: Array.isArray(jsonData.projects),
            hasSkills: !!jsonData.skills,
          });
        } else {
          console.warn("Resume data missing required fields:", resumeResponse);
        }
      } else if (typeof resumeResponse === "string") {
        try {
          const parsed = JSON.parse(resumeResponse);
          if (parsed.name && parsed.contact) {
            jsonData = parsed as ResumeData;
            console.log("Parsed string JSON resume data:", jsonData);
          }
        } catch (parseError) {
          console.error("Failed to parse JSON string:", parseError);
          // Not JSON, will treat as HTML below
        }
      }

      if (jsonData) {
        // It's JSON data - set it and render
        console.log("Setting resume data and preparing to render");
        setResumeData(jsonData);
        // Generate HTML immediately for immediate display
        const html = renderResumeTemplate(jsonData, selectedTemplate);
        setAiGeneratedResumeHtml(html);
        console.log("Resume data set, HTML generated, length:", html.length);

        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.success("Resume generated successfully!", {
          duration: 3000,
        });

        setShowTemplate(true);
        setShowResumeView(true); // Switch to resume-only view

        // Scroll to template after a brief delay to ensure it's rendered
        setTimeout(() => {
          if (editableDivRef.current) {
            editableDivRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);
      } else {
        // It's HTML, use old transform method
        console.log("Treating response as HTML");
        setAiGeneratedResumeHtml(transformResumeHtml(resumeResponse));

        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.success("Resume generated successfully!", {
          duration: 3000,
        });

        setShowTemplate(true);
        setShowResumeView(true);
      }
    } catch (error: any) {
      console.error("Error generating resume template:", error);
      let errorMessage =
        "Failed to generate resume template. Please try again.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Request timed out. Generation may take longer. Please try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.detail ||
          "Invalid request. Please check your inputs.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 5000,
      });
      setShowTemplate(false);
    } finally {
      setGeneratingResume(false);
    }
  };

  const removeResume = () => {
    setUploadedResume(null);
    setAnalysisResult(null);
    setShowTemplate(false);
    setShowResumeView(false);
    setAiGeneratedResumeHtml("");
    setResumeData(null);
    setIsInitialized(false);
    setJobDescription("");
    localStorage.removeItem("resume_text");
    localStorage.removeItem("jd");
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 2000,
    });
  };

  const handleDownloadPdf = async () => {
    if (!editableDivRef.current) {
      toast.error("No resume content to download");
      return;
    }

    try {
      const element = editableDivRef.current;

      // Show loading message
      toast.loading("Generating PDF...", {
        id: "pdf-loading",
        duration: 10000,
      });

      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `resume-${selectedTemplate}-${Date.now()}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.95,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 1200,
          windowHeight: 1600,
          allowTaint: false,
          removeContainer: true,
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
          compress: true,
          precision: 16,
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          avoid: [
            ".resume-section",
            ".resume-experience-item",
            ".resume-project-item",
            ".resume-education-item",
          ],
        },
      };

      // Create a wrapper to ensure proper rendering
      const wrapper = document.createElement("div");
      wrapper.style.width = "8.5in";
      wrapper.style.maxWidth = "8.5in";
      wrapper.style.margin = "0 auto";
      wrapper.style.padding = "0";
      wrapper.style.backgroundColor = "#ffffff";
      wrapper.style.position = "relative";

      // Clone the element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.width = "100%";
      clonedElement.style.maxWidth = "100%";
      clonedElement.style.margin = "0";
      clonedElement.style.padding = "2rem 2.5rem";
      clonedElement.style.boxSizing = "border-box";
      clonedElement.style.backgroundColor = "#ffffff";

      wrapper.appendChild(clonedElement);

      // Append to body temporarily (off-screen)
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "8.5in";
      tempContainer.style.backgroundColor = "#ffffff";
      tempContainer.appendChild(wrapper);
      document.body.appendChild(tempContainer);

      // Wait a bit for rendering
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate PDF
      await html2pdf().set(opt).from(wrapper).save();

      // Cleanup
      document.body.removeChild(tempContainer);

      toast.dismiss("pdf-loading");
      toast.success("PDF downloaded successfully!", {
        duration: 3000,
      });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast.dismiss("pdf-loading");
      toast.error("Failed to generate PDF. Please try again.", {
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    // Render resume when data is available and template is shown
    if (resumeData && showTemplate && editableDivRef.current) {
      console.log(
        "Rendering resume with template:",
        selectedTemplate,
        "Data:",
        resumeData
      );
      try {
        const html = renderResumeTemplate(resumeData, selectedTemplate);
        if (html && html.trim().length > 0) {
          editableDivRef.current.innerHTML = html;
          setAiGeneratedResumeHtml(html);
          setIsInitialized(true);
          console.log(
            "Resume rendered successfully, HTML length:",
            html.length
          );
        } else {
          console.error("Generated HTML is empty");
        }
      } catch (error) {
        console.error("Error rendering resume template:", error);
      }
    } else if (
      aiGeneratedResumeHtml &&
      !resumeData &&
      showTemplate &&
      editableDivRef.current
    ) {
      // Legacy HTML support (for backwards compatibility)
      console.log("Rendering legacy HTML resume");
      try {
        editableDivRef.current.innerHTML = transformResumeHtml(
          aiGeneratedResumeHtml
        );
        setIsInitialized(true);
      } catch (error) {
        console.error("Error rendering legacy HTML:", error);
      }
    }
  }, [resumeData, selectedTemplate, showTemplate]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("resume_text");
      localStorage.removeItem("jd");
    };
  }, []);

  function transformResumeHtml(rawHtml: string): string {
    // Use DOMParser to parse the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    const root = doc.body;

    // 1. Convert h3 to section wrappers with h2 inside
    Array.from(root.querySelectorAll("h3")).forEach((h3) => {
      const section = doc.createElement("section");
      section.className = "resume-section";
      const h2 = doc.createElement("h2");
      h2.textContent = h3.textContent;
      section.appendChild(h2);
      // Move all siblings until next h3/h2/h1 or end into this section
      let next = h3.nextSibling;
      while (next && !next.nodeName.match(/^H[1-3]$/i)) {
        const toMove = next;
        next = next.nextSibling;
        section.appendChild(toMove);
      }
      h3.replaceWith(section);
      section.insertBefore(h2, section.firstChild);
    });

    // 2. Convert h4 in Experience/Education to .resume-side-row
    Array.from(root.querySelectorAll("section")).forEach((section) => {
      if (
        section.querySelector("h2") &&
        [
          "Experience",
          "Education",
          "Work Experience",
          "Professional Experience",
        ].includes(section.querySelector("h2")?.textContent || "")
      ) {
        Array.from(section.querySelectorAll("h4")).forEach((h4) => {
          // Try to extract title/company/dates
          const text = h4.textContent || "";
          const match = text.match(/^(.*?)(?:,\s*)?([\w\s]+)?\s*\(([^)]+)\)$/);
          let title = text,
            dates = "";
          if (match) {
            title = match[1].trim();
            dates = match[3].trim();
          }
          const row = doc.createElement("div");
          row.className = "resume-side-row";
          const heading = doc.createElement("div");
          heading.className = "resume-side-heading";
          heading.textContent = title;
          row.appendChild(heading);
          if (dates) {
            const dateDiv = doc.createElement("div");
            dateDiv.className = "resume-dates";
            dateDiv.textContent = dates;
            row.appendChild(dateDiv);
          }
          h4.replaceWith(row);
        });
      }
    });

    // 3. Optionally, split skills into two columns if ul has many items
    Array.from(root.querySelectorAll("section")).forEach((section) => {
      if (
        section.querySelector("h2") &&
        section
          .querySelector("h2")
          ?.textContent?.toLowerCase()
          .includes("skill")
      ) {
        const ul = section.querySelector("ul");
        if (ul && ul.children.length > 6) {
          // Split into two columns
          const col1 = doc.createElement("ul");
          const col2 = doc.createElement("ul");
          Array.from(ul.children).forEach((li, i) => {
            (i % 2 === 0 ? col1 : col2).appendChild(li.cloneNode(true));
          });
          const row = doc.createElement("div");
          row.style.display = "flex";
          row.style.gap = "2em";
          row.appendChild(col1);
          row.appendChild(col2);
          ul.replaceWith(row);
        }
      }
    });

    // 4. Add resume-subheading class to h2 under h1 (for subtitle)
    const h1 = root.querySelector("h1");
    if (h1 && h1.nextElementSibling && h1.nextElementSibling.tagName === "H2") {
      h1.nextElementSibling.classList.add("resume-subheading");
    }

    return root.innerHTML;
  }

  // Full-screen loading overlay for resume analysis
  const AnalysisLoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto px-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
          <div className="relative bg-primary/10 rounded-full p-8">
            <Search className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Analyzing Your Resume
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Comparing your resume with the job description...
          </motion.p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="flex space-x-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <Progress value={undefined} className="h-1" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2 text-sm text-muted-foreground"
        >
          <FileText className="h-4 w-4" />
          <span>This may take a minute</span>
        </motion.div>
      </div>
    </motion.div>
  );

  // Full-screen loading overlay for resume generation
  const GenerationLoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto px-4">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"></div>
          <div className="relative bg-purple-500/10 rounded-full p-8">
            <Wand2 className="h-16 w-16 text-purple-500 animate-pulse" />
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Generating Your Resume
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Creating an AI-powered resume tailored for you...
          </motion.p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="flex space-x-2 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <Progress value={undefined} className="h-1" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2 text-sm text-muted-foreground"
        >
          <Sparkles className="h-4 w-4" />
          <span>This may take a few minutes</span>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 flex flex-col min-h-[calc(100vh-4rem)] py-6 relative">
      {/* Full-screen loading overlays */}
      <AnimatePresence>
        {isAnalyzing && <AnalysisLoadingOverlay key="analysis-overlay" />}
        {generatingResume && (
          <GenerationLoadingOverlay key="generation-overlay" />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4"
      >
        {window.innerWidth > 480 && (
          <div>
            <h1 className="text-2xl font-bold">Resume Analyzer & Generator</h1>
            <p className="text-muted-foreground">
              Upload your resume and job description to get professional
              analysis and AI-generated resume template.
            </p>
          </div>
        )}
        {/* {window.innerWidth <= 480 && !uploadedResume && (
          <div>
            <h1 className="text-2xl font-bold">Resume Analyzer & Generator</h1>
            <p className="text-muted-foreground">
              Upload your resume and job description to get professional
              analysis and AI-generated resume template.
            </p>
          </div>
        )} */}
      </motion.div>

      {!analysisResult ? (
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex flex-col items-center justify-center h-full p-6 resume-card-content">
            <div className="w-full max-w-6xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Description Input */}
                <div className="space-y-2 h-full flex flex-col">
                  <Label
                    htmlFor="job-description"
                    className="text-base font-medium"
                  >
                    Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px] resize-none flex-1"
                    style={{ overflow: "none", scrollbarWidth: "thin" }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the job description to analyze how well your resume
                    matches the requirements.
                  </p>
                </div>

                {/* Resume Upload */}
                <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-full">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload Resume (PDF)
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-6">
                    Supports PDF format only (Max 5MB)
                  </p>
                  <Input
                    ref={resumeInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    id="resume-upload"
                  />
                  <Label htmlFor="resume-upload" asChild>
                    <Button onClick={() => resumeInputRef.current?.click()}>
                      Select PDF File
                    </Button>
                  </Label>
                </div>
              </div>

              {uploadedResume && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  // className="w-50"
                >
                  <Card className="w-full md:w-1/2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{uploadedResume.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(uploadedResume.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removeResume}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 flex justify-center"
                      >
                        <Button
                          onClick={analyzeResume}
                          disabled={isAnalyzing || !jobDescription.trim()}
                          className="w-full"
                          size="lg"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Analyze Resume vs Job Description
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : showResumeView && showTemplate ? (
        // Resume-only view (after generation)
        <AnimatePresence mode="wait">
          <motion.div
            key="resume-only-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={removeResume}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Back to Upload
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Generated Resume Template
                  </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPdf}
                      className="gap-2"
                      disabled={!showTemplate || generatingResume}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={
                      selectedTemplate === "modern" ? "default" : "outline"
                    }
                    onClick={() => {
                      setSelectedTemplate("modern");
                    }}
                  >
                    Modern
                  </Button>
                  <Button
                    variant={
                      selectedTemplate === "minimal" ? "default" : "outline"
                    }
                    onClick={() => {
                      setSelectedTemplate("minimal");
                    }}
                  >
                    Minimal
                  </Button>
                  <Button
                    variant={
                      selectedTemplate === "classic" ? "default" : "outline"
                    }
                    onClick={() => {
                      setSelectedTemplate("classic");
                    }}
                  >
                    Classic
                  </Button>
                  <Button
                    variant={
                      selectedTemplate === "creative" ? "default" : "outline"
                    }
                    onClick={() => {
                      setSelectedTemplate("creative");
                    }}
                  >
                    Creative
                  </Button>
                </div>
                {!generatingResume && (
                  <>
                    {resumeData || aiGeneratedResumeHtml ? (
                      <>
                        <motion.div
                          key={`resume-${selectedTemplate}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          ref={editableDivRef}
                          className={`prose prose-sm dark:prose-invert border rounded-md p-4 bg-background text-foreground min-h-[400px] transition-colors duration-300 border-muted ${
                            selectedTemplate === "modern"
                              ? "resume-template-modern"
                              : selectedTemplate === "minimal"
                              ? "resume-template-minimal"
                              : selectedTemplate === "classic"
                              ? "resume-template-classic"
                              : "resume-template-creative"
                          }`}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onInput={(e) => {
                            setAiGeneratedResumeHtml(e.currentTarget.innerHTML);
                          }}
                          style={{ outline: "none", cursor: "text" }}
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xs text-muted-foreground mt-2"
                        >
                          Click and edit your resume above. When ready, click
                          "Download PDF".
                        </motion.div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Generating your resume...
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <Toaster position="top-right" />
            </Card>
          </motion.div>
        </AnimatePresence>
      ) : analysisResult ? (
        // Analysis results view (before resume generation)
        <AnimatePresence mode="wait">
          <motion.div
            key="analysis-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={removeResume}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Back to Upload
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="md:col-span-1"
              >
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-base font-semibold">
                      Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4 pt-2">
                    {/* Resume Score */}
                    <div className="flex flex-row items-center justify-center gap-8 py-2">
                      {/* Resume Score */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.3,
                          type: "spring",
                        }}
                        className="flex flex-col items-center"
                      >
                        <h3 className="font-medium text-sm mb-1">
                          Resume Score
                        </h3>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              className="text-muted stroke-current"
                              strokeWidth="7"
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                            ></circle>
                            <motion.circle
                              className="text-primary stroke-current"
                              strokeWidth="7"
                              strokeLinecap="round"
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 40}
                              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                              animate={{
                                strokeDashoffset:
                                  2 *
                                  Math.PI *
                                  40 *
                                  (1 - analysisResult.score / 100),
                              }}
                              transition={{
                                duration: 1,
                                delay: 0.5,
                                ease: "easeOut",
                              }}
                              transform="rotate(-90 50 50)"
                            ></motion.circle>
                          </svg>
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.8 }}
                            className="absolute text-2xl font-bold text-primary"
                          >
                            {analysisResult.score}
                          </motion.span>
                        </div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="mt-2 text-xs text-muted-foreground text-center"
                        >
                          {analysisResult.score >= 80
                            ? "Excellent!"
                            : analysisResult.score >= 60
                            ? "Good, but can improve."
                            : "Needs improvement."}
                        </motion.p>
                      </motion.div>
                      {/* Job Match Score */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.4,
                          type: "spring",
                        }}
                        className="flex flex-col items-center"
                      >
                        <h3 className="font-medium text-sm mb-1">Job Match</h3>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              className="text-muted stroke-current"
                              strokeWidth="7"
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                            ></circle>
                            <motion.circle
                              className="text-green-500 stroke-current"
                              strokeWidth="7"
                              strokeLinecap="round"
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 40}
                              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                              animate={{
                                strokeDashoffset:
                                  2 *
                                  Math.PI *
                                  40 *
                                  (1 - analysisResult.matchScore / 100),
                              }}
                              transition={{
                                duration: 1,
                                delay: 0.6,
                                ease: "easeOut",
                              }}
                              transform="rotate(-90 50 50)"
                            ></motion.circle>
                          </svg>
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.9 }}
                            className="absolute text-2xl font-bold text-green-600"
                          >
                            {analysisResult.matchScore}%
                          </motion.span>
                        </div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.1 }}
                          className="mt-2 text-xs text-muted-foreground text-center"
                        >
                          Job match
                        </motion.p>
                      </motion.div>
                    </div>
                    {/* Missing Keywords */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="font-medium text-xs mb-1">
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.missingKeywords.map(
                          (keyword, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                            >
                              <Badge
                                variant="destructive"
                                className="text-xs px-2 py-0.5"
                              >
                                {keyword}
                              </Badge>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                    {/* Recommended Keywords */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="font-medium text-xs mb-1">Recommended</h3>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.recommendedKeywords.map(
                          (keyword, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.7 + index * 0.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0.5"
                              >
                                {keyword}
                              </Badge>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                    {/* Generate Template Button */}
                    <div className="flex flex-col items-center gap-3 my-6">
                      <span className="font-semibold text-base mb-2 text-center text-primary">
                        What would you like to do?
                      </span>
                      <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col items-center w-full mt-2">
                          <fieldset className="flex flex-col gap-2 w-full">
                            <legend className="sr-only">Resume Mode</legend>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="resume-mode"
                                value="jd_resume"
                                checked={resumeMode === "jd_resume"}
                                onChange={() => {
                                  setResumeMode("jd_resume");
                                }}
                                className="accent-primary"
                                style={{ width: "1rem", height: "1rem" }}
                              />
                              <span className="text-sm">
                                Create Resume According to JD
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="resume-mode"
                                value="enhance_resume"
                                checked={resumeMode === "enhance_resume"}
                                onChange={() => {
                                  setResumeMode("enhance_resume");
                                }}
                                className="accent-primary"
                                style={{ width: "1rem", height: "1rem" }}
                              />
                              <span className="text-sm">
                                Enhance Your Current Resume
                              </span>
                            </label>
                          </fieldset>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3"
                          >
                            <Button
                              variant="default"
                              onClick={() => {
                                generateResumeTemplate();
                              }}
                              type="button"
                              className="w-full"
                              size="lg"
                              disabled={generatingResume}
                            >
                              {generatingResume ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-5 w-5" />
                                  Generate AI Powered Resume
                                </>
                              )}
                            </Button>
                          </motion.div>
                          {resumeMode === "jd_resume" && (
                            <div className="w-full mt-3">
                              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs rounded px-3 py-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-yellow-500 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                                  />
                                </svg>
                                <span>
                                  <strong>Note:</strong> Generating a resume
                                  "According to JD" will create a new resume
                                  tailored to the job description, which may
                                  include skills and content inferred from the
                                  JD and your uploaded resume. Please review and
                                  edit the generated resume to ensure it
                                  accurately reflects your real experience and
                                  skills.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="flex items-center gap-2 font-medium mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Strengths
                      </h3>
                      <ul className="space-y-2 pl-7 list-disc">
                        {analysisResult.strengths.map((strength, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="text-sm"
                          >
                            {strength}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="flex items-center gap-2 font-medium mb-3">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2 pl-7 list-disc">
                        {analysisResult.weaknesses.map((weakness, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="text-sm"
                          >
                            {weakness}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="font-medium mb-3">Recommendations</h3>
                      <ul className="space-y-3 pl-7 list-decimal">
                        {analysisResult.suggestions.map((suggestion, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="text-sm"
                          >
                            {suggestion}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : null}
    </div>
  );
}
