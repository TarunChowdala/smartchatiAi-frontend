import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Search,
  Wand2,
  Download,
  Key,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import "./templates/ResumeTemplates.css";
import { useCompareResumeJD, useGenerateResume, useGeneratePDF } from "@/hooks/resume/useResume";
import { useResumeSession, AnalysisResult } from "../ResumeSession";
import { useMyUsage } from "@/hooks/usage/useUsage";
import { useGetGeminiApiKey } from "@/hooks/auth/useAuth";
import { getTemplate, type TemplateType, type ResumeData as TemplateResumeData } from "./templates";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Resume JSON Data Types - Old Format (for backward compatibility)
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
  title?: string;
  contact: ResumeContact;
  summary: string;
  summaryHeadline?: string;
  summaryHighlights?: string[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  certifications?: string[];
  achievements?: string[];
};

// New Format Types (from prompt)
type NewResumeBasics = {
  full_name: string;
  title?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
};

type NewResumeSummary = {
  headline?: string;
  highlights?: string[];
};

type NewResumeExperience = {
  company: string;
  role: string;
  location?: string;
  employment_type?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  summary?: string;
  highlights?: string[];
  tech_stack?: string[];
};

type NewResumeProject = {
  name: string;
  type?: string;
  link?: string;
  description?: string;
  highlights?: string[];
  tech_stack?: string[];
};

type NewResumeEducation = {
  institution: string;
  degree: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  highlights?: string[];
};

type NewResumeSkillCategory = {
  name: string;
  items: string[];
};

type NewResumeData = {
  basics?: NewResumeBasics;
  summary?: NewResumeSummary;
  experience?: NewResumeExperience[];
  projects?: NewResumeProject[];
  education?: NewResumeEducation[];
  skills?: {
    categories?: NewResumeSkillCategory[];
  };
  certifications?: string[];
  achievements?: string[];
  metadata?: {
    target_role?: string;
    experience_level?: string;
    resume_version?: string;
  };
};

// Helper function to format dates from YYYY-MM to readable format
const formatDateRange = (startDate?: string, endDate?: string | null, isCurrent?: boolean): string => {
  if (!startDate) return "";
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month] = dateStr.split("-");
    if (!year) return "";
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = month ? monthNames[parseInt(month) - 1] : "";
    return monthName ? `${monthName} ${year}` : year;
  };
  
  const start = formatDate(startDate);
  if (isCurrent || !endDate) {
    return `${start} - Present`;
  }
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

// Helper function to format contact info (handles empty phone)
const formatContactInfo = (
  contact: ResumeContact,
  separator: " • " | " | " = " • "
): string => {
  const parts = [];
  if (contact.phone && contact.phone.trim()) {
    parts.push(contact.phone);
  }
  parts.push(contact.email);
  if (contact.location && contact.location.trim()) {
    parts.push(contact.location);
  }
  return parts.join(separator);
};

// Check if data is in new format
const isNewFormat = (data: any): boolean => {
  return (
    data &&
    typeof data === "object" &&
    (data.basics || (data.summary && typeof data.summary === "object" && data.summary.headline !== undefined) || 
     (data.experience && Array.isArray(data.experience) && data.experience.length > 0 && data.experience[0].start_date))
  );
};

// Transform new format to old format
const transformNewFormatToOld = (newData: NewResumeData): ResumeData => {
  const basics: NewResumeBasics = newData.basics || { full_name: "" };
  const contact = basics.contact || {};
  const location = basics.location || {};
  
  // Format location string
  const locationParts = [];
  if (location.city) locationParts.push(location.city);
  if (location.region) locationParts.push(location.region);
  if (location.country) locationParts.push(location.country);
  const locationStr = locationParts.join(", ");
  
  // Transform contact
  const oldContact: ResumeContact = {
    phone: contact.phone || "",
    email: contact.email || "",
    location: locationStr,
  };
  
  // Transform summary
  const summary = newData.summary;
  let summaryText = "";
  if (summary?.headline) {
    summaryText = summary.headline;
  }
  if (summary?.highlights && summary.highlights.length > 0) {
    if (summaryText) summaryText += " ";
    summaryText += summary.highlights.join(" ");
  }
  
  // Transform experience
  const oldExperience: ResumeExperience[] = (newData.experience || []).map((exp) => ({
    role: exp.role || "",
    company: exp.company || "",
    location: exp.location || "",
    duration: formatDateRange(exp.start_date, exp.end_date, exp.is_current),
    details: exp.highlights || (exp.summary ? [exp.summary] : []) || [],
  }));
  
  // Transform projects
  const oldProjects: ResumeProject[] = (newData.projects || []).map((proj) => {
    const details = [];
    if (proj.description) details.push(proj.description);
    if (proj.highlights && proj.highlights.length > 0) {
      details.push(...proj.highlights);
    }
    return {
      title: proj.name || "",
      link: proj.link || undefined,
      details: details.length > 0 ? details : [],
    };
  });
  
  // Transform education
  const oldEducation: ResumeEducation[] = (newData.education || []).map((edu) => ({
    degree: edu.degree || "",
    university: edu.institution || "",
    duration: formatDateRange(edu.start_date, edu.end_date),
    cgpa: edu.gpa || undefined,
  }));
  
  // Transform skills
  const oldSkills: ResumeSkills = {};
  if (newData.skills?.categories) {
    newData.skills.categories.forEach((category) => {
      const catName = category.name.toLowerCase();
      if (catName.includes("frontend")) {
        oldSkills.frontend = category.items || [];
      } else if (catName.includes("backend")) {
        oldSkills.backend = category.items || [];
      } else if (catName.includes("database")) {
        oldSkills.database = category.items || [];
      } else if (catName.includes("cloud") || catName.includes("devops") || catName.includes("tools") || catName.includes("platform")) {
        oldSkills.tools = [...(oldSkills.tools || []), ...(category.items || [])];
      } else if (catName.includes("soft")) {
        oldSkills.soft_skills = category.items || [];
      } else if (!oldSkills.tools) {
        oldSkills.tools = category.items || [];
      }
    });
  }
  
  return {
    name: basics.full_name || "",
    title: basics.title,
    contact: oldContact,
    summary: summaryText,
    summaryHeadline: summary?.headline,
    summaryHighlights: summary?.highlights,
    experience: oldExperience,
    projects: oldProjects,
    education: oldEducation,
    skills: oldSkills,
    certifications: newData.certifications,
    achievements: newData.achievements,
  };
};

// Transform old format to new format for PDF API
const transformOldFormatToNew = (oldData: ResumeData): NewResumeData => {
  // Parse location from contact.location string (format: "City, Region, Country")
  const locationParts = oldData.contact.location ? oldData.contact.location.split(",").map(s => s.trim()) : [];
  const location = locationParts.length > 0 ? {
    city: locationParts[0] || undefined,
    region: locationParts[1] || undefined,
    country: locationParts[2] || locationParts.slice(1).join(", ") || undefined,
  } : undefined;

  // Parse duration to extract dates (format: "Jan 2020 - Present" or "Jan 2020 - Dec 2022")
  const parseDuration = (duration: string): { start_date?: string; end_date?: string | null; is_current?: boolean } => {
    if (!duration) return {};
    const isCurrent = duration.toLowerCase().includes("present");
    const parts = duration.split("-").map(s => s.trim());
    if (parts.length < 1) return {};
    
    const parseDate = (dateStr: string): string | undefined => {
      if (!dateStr || dateStr.toLowerCase() === "present") return undefined;
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const parts = dateStr.trim().split(" ");
      if (parts.length >= 2) {
        const month = monthNames.indexOf(parts[0].toLowerCase());
        const year = parts[1];
        if (month >= 0 && year) {
          return `${year}-${String(month + 1).padStart(2, "0")}`;
        }
      } else if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
        return `${parts[0]}-01`;
      }
      return undefined;
    };

    return {
      start_date: parseDate(parts[0]),
      end_date: isCurrent ? null : (parts[1] ? parseDate(parts[1]) : undefined),
      is_current: isCurrent,
    };
  };

  // Transform experience
  const newExperience: NewResumeExperience[] = oldData.experience.map((exp) => {
    const dateInfo = parseDuration(exp.duration);
    return {
      company: exp.company,
      role: exp.role,
      location: exp.location || undefined,
      start_date: dateInfo.start_date,
      end_date: dateInfo.end_date,
      is_current: dateInfo.is_current,
      highlights: exp.details || [],
    };
  });

  // Transform projects
  const newProjects: NewResumeProject[] = oldData.projects.map((proj) => ({
    name: proj.title,
    link: proj.link,
    highlights: proj.details || [],
  }));

  // Transform education
  const newEducation: NewResumeEducation[] = oldData.education.map((edu) => {
    const dateInfo = parseDuration(edu.duration);
    return {
      institution: edu.university,
      degree: edu.degree,
      start_date: dateInfo.start_date,
      end_date: dateInfo.end_date || undefined,
      gpa: edu.cgpa,
    };
  });

  // Transform skills
  const skillCategories: NewResumeSkillCategory[] = [];
  if (oldData.skills.frontend && oldData.skills.frontend.length > 0) {
    skillCategories.push({ name: "Frontend", items: oldData.skills.frontend });
  }
  if (oldData.skills.backend && oldData.skills.backend.length > 0) {
    skillCategories.push({ name: "Backend", items: oldData.skills.backend });
  }
  if (oldData.skills.database && oldData.skills.database.length > 0) {
    skillCategories.push({ name: "Database", items: oldData.skills.database });
  }
  if (oldData.skills.tools && oldData.skills.tools.length > 0) {
    skillCategories.push({ name: "Tools & Technologies", items: oldData.skills.tools });
  }
  if (oldData.skills.soft_skills && oldData.skills.soft_skills.length > 0) {
    skillCategories.push({ name: "Soft Skills", items: oldData.skills.soft_skills });
  }

  return {
    basics: {
      full_name: oldData.name,
      title: oldData.title,
      location,
      contact: {
        email: oldData.contact.email,
        phone: oldData.contact.phone || undefined,
      },
    },
    summary: {
      headline: oldData.summaryHeadline,
      highlights: oldData.summaryHighlights || (oldData.summary ? [oldData.summary] : []),
    },
    experience: newExperience,
    projects: newProjects,
    education: newEducation,
    skills: skillCategories.length > 0 ? { categories: skillCategories } : undefined,
    certifications: oldData.certifications,
    achievements: oldData.achievements,
  };
};

export default function ResumePage() {
  const navigate = useNavigate();
  const {
    jobDescription,
    setJobDescription,
    resumeMode,
    setResumeMode,
    selectedTemplate,
    setSelectedTemplate,
    resumeData,
    setResumeData,
    analysisResult,
    setAnalysisResult,
    showTemplate,
    setShowTemplate,
    showResumeView,
    setShowResumeView,
    aiGeneratedResumeHtml,
    setAiGeneratedResumeHtml,
  } = useResumeSession();

  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);
  const [generatingResume, setGeneratingResume] = useState(false);

  // React Query hooks
  const compareResumeMutation = useCompareResumeJD();
  const generateResumeMutation = useGenerateResume();
  const generatePDFMutation = useGeneratePDF();
  const { data: myUsageData } = useMyUsage();
  const { data: geminiApiKeyData, isLoading: geminiApiKeyLoading } = useGetGeminiApiKey();
  const hasGeminiKeyStored =
    geminiApiKeyData?.has_key === true ||
    geminiApiKeyData?.has_gemini_key === true ||
    (geminiApiKeyData?.gemini_api_key != null && geminiApiKeyData.gemini_api_key !== "");

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

    // Check usage limits
    if (myUsageData?.usage) {
      const { resumes } = myUsageData.usage;
      if (resumes.limit !== "unlimited" && resumes.current >= resumes.limit) {
        toast.error(
          `You have reached your resume analysis limit (${resumes.limit}). Please upgrade or wait for your limit to reset.`,
          {
            duration: 4000,
          }
        );
        return;
      }
    }

    setIsAnalyzing(true);

    try {
      const response = await compareResumeMutation.mutateAsync({
        file: uploadedResume,
        jobDescription,
      });

      // Validate response structure
      if (!response) {
        throw new Error("Invalid response from server");
      }

      const analysisData = response.analysis;
      if (!analysisData) {
        throw new Error("Analysis data not found in response");
      }

      if (response.resume_text) {
        localStorage.setItem("resume_text", response.resume_text);
      }
      if (response.job_description) {
        localStorage.setItem("jd", response.job_description);
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

    // Check usage limits
    if (myUsageData?.usage) {
      const { resumes } = myUsageData.usage;
      if (resumes.limit !== "unlimited" && resumes.current >= resumes.limit) {
        toast.error(
          `You have reached your resume generation limit (${resumes.limit}). Please upgrade or wait for your limit to reset.`,
          {
            duration: 4000,
          }
        );
        return;
      }
    }

    try {
      setGeneratingResume(true);
      setShowTemplate(false); // Hide template during generation

      const response = await generateResumeMutation.mutateAsync({
        resume_type: resumeMode,
        resume_text: resumeText || "",
        job_description: jobDescription || "",
      });

      if (!response) {
        throw new Error("Invalid response from server");
      }

      let resumeResponse: any = null;

      if (response && typeof response === "object") {
        if (response.basics && typeof response.basics === "object") {
          resumeResponse = response;
        }
        else if (
          response.name &&
          response.contact &&
          typeof response.contact === "object" &&
          response.contact.email
        ) {
          resumeResponse = response;
        }
        else if (response.aiGeneratedResume) {
          resumeResponse = response.aiGeneratedResume;
        } else if (response.resume) {
          resumeResponse = response.resume;
        } else if (response.data) {
          resumeResponse = response.data;
        }
      }

      if (!resumeResponse) {
        console.error(
          "❌ Could not find resume data in response. Response structure:",
          {
            keys: response ? Object.keys(response) : [],
            data: response,
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
        // Check if it's the new format
        if (isNewFormat(resumeResponse)) {
          try {
            jsonData = transformNewFormatToOld(resumeResponse as NewResumeData);
          } catch (transformError) {
            console.error("Error transforming new format:", transformError);
          }
        }
        // Check if it's the old format
        else if (
          resumeResponse.name &&
          resumeResponse.contact &&
          typeof resumeResponse.contact === "object" &&
          resumeResponse.contact.email
        ) {
          jsonData = resumeResponse as ResumeData;
        } else {
          console.warn("Resume data missing required fields:", resumeResponse);
        }
      } else if (typeof resumeResponse === "string") {
        try {
          const parsed = JSON.parse(resumeResponse);
          if (isNewFormat(parsed)) {
            jsonData = transformNewFormatToOld(parsed as NewResumeData);
          } else if (parsed.name && parsed.contact) {
            jsonData = parsed as ResumeData;
          }
        } catch (parseError) {
          console.error("Failed to parse JSON string:", parseError);
        }
      }

      if (jsonData) {
        setResumeData(jsonData);

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

  const handleDownloadPDF = async () => {
    if (!resumeData) {
      toast.error("No resume data available to download.", {
        duration: 3000,
      });
      return;
    }

    try {
      // Transform old format to new format
      let newFormatData: NewResumeData;
      if (isNewFormat(resumeData)) {
        // If already in new format, use it directly (but remove metadata if present)
        const { metadata, ...dataWithoutMetadata } = resumeData as any;
        newFormatData = dataWithoutMetadata as NewResumeData;
      } else {
        newFormatData = transformOldFormatToNew(resumeData);
      }

      // Ensure template_id matches the selected template
      const templateId = selectedTemplate as "modern" | "minimal" | "classic";

      toast.loading("Generating PDF...", { id: "pdf-download" });

      const blob = await generatePDFMutation.mutateAsync({
        template_id: templateId,
        resume_data: newFormatData,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${templateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", {
        id: "pdf-download",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      let errorMessage = "Failed to generate PDF. Please try again.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || "Invalid request. Please check your resume data.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        id: "pdf-download",
        duration: 5000,
      });
    }
  };


  // Initialize when resume data is available
  useEffect(() => {
    if (resumeData && showTemplate) {
      setIsInitialized(true);
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
            {!geminiApiKeyLoading && !hasGeminiKeyStored && (
              <div className="w-full max-w-6xl mb-6">
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
                  <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="flex flex-wrap items-center gap-2">
                    <span className="text-sm">
                      Add your Gemini API key to unlock resume analysis and generation.
                    </span>
                    <a
                      href="https://youtu.be/ne3SLfF_gk0?si=M27e3nLopn9AxAE6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm text-amber-700 dark:text-amber-300 underline underline-offset-2"
                    >
                      Watch how to add your Gemini API key
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 shrink-0"
                      onClick={() => navigate("/dashboard/settings")}
                    >
                      <Settings className="h-4 w-4" />
                      Go to Settings
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}
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
                    placeholder={!hasGeminiKeyStored && !geminiApiKeyLoading ? "Add Gemini API key in Settings to use resume features" : "Paste the job description here..."}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px] resize-none flex-1"
                    style={{ overflow: "none", scrollbarWidth: "thin" }}
                    disabled={!geminiApiKeyLoading && !hasGeminiKeyStored}
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
                    <Button 
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={!geminiApiKeyLoading && !hasGeminiKeyStored}
                    >
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
                          disabled={isAnalyzing || !jobDescription.trim() || (!geminiApiKeyLoading && !hasGeminiKeyStored)}
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
            className="flex-1 flex flex-col overflow-y-auto custom-scrollbar"
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
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
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={!resumeData || generatePDFMutation.isPending}
                    className="gap-2"
                  >
                    {generatePDFMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
                {!generatingResume && (
                  <>
                    {resumeData ? (
                      <motion.div
                        key={`resume-${selectedTemplate}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="resume-preview-container"
                        ref={editableDivRef}
                      >
                        {(() => {
                          const TemplateComponent = getTemplate(selectedTemplate as TemplateType);
                          return <TemplateComponent data={resumeData as TemplateResumeData} />;
                        })()}
                      </motion.div>
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
            className="flex-1 flex flex-col overflow-y-auto custom-scrollbar"
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
                              disabled={generatingResume || (!geminiApiKeyLoading && !hasGeminiKeyStored)}
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
