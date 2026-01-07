import { createContext, useState, useContext, ReactNode } from "react";

export type AnalysisResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
  matchScore: number;
  missingKeywords: string[];
  recommendedKeywords: string[];
};

export type ResumeContact = {
  phone: string;
  email: string;
  location: string;
};

export type ResumeExperience = {
  role: string;
  company: string;
  location: string;
  duration: string;
  details: string[];
};

export type ResumeProject = {
  title: string;
  link?: string;
  details: string[];
};

export type ResumeEducation = {
  degree: string;
  university: string;
  duration: string;
  cgpa?: string;
};

export type ResumeSkills = {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  tools?: string[];
  soft_skills?: string[];
};

export type ResumeData = {
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

interface ResumeSessionContextType {
  jobDescription: string;
  setJobDescription: (jobDescription: string) => void;
  resumeMode: "jd_resume" | "enhance_resume";
  setResumeMode: (mode: "jd_resume" | "enhance_resume") => void;
  selectedTemplate: "modern" | "minimal" | "classic";
  setSelectedTemplate: (template: "modern" | "minimal" | "classic") => void;
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  showTemplate: boolean;
  setShowTemplate: (show: boolean) => void;
  showResumeView: boolean;
  setShowResumeView: (show: boolean) => void;
  aiGeneratedResumeHtml: string;
  setAiGeneratedResumeHtml: (html: string) => void;
}

export const ResumeSessionContext = createContext<
  ResumeSessionContextType | undefined
>(undefined);

export const ResumeSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumeMode, setResumeMode] = useState<"jd_resume" | "enhance_resume">("enhance_resume");
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "minimal" | "classic">("modern");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showResumeView, setShowResumeView] = useState(false);
  const [aiGeneratedResumeHtml, setAiGeneratedResumeHtml] = useState<string>("");

  return (
    <ResumeSessionContext.Provider
      value={{
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
      }}
    >
      {children}
    </ResumeSessionContext.Provider>
  );
};

export const useResumeSession = () => {
  const context = useContext(ResumeSessionContext);
  if (context === undefined) {
    throw new Error(
      "useResumeSession must be used within a ResumeSessionProvider"
    );
  }
  return context;
};

