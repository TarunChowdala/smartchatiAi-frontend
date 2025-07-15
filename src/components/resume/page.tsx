import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Sparkles,
  Loader2,
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
// import { parse } from "html-react-parser";

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
    "modern" | "dark" | "minimal" | "classic"
  >("modern");
  const [resumeMode, setResumeMode] = useState<"jd_resume" | "enhance_resume">(
    "enhance_resume"
  );
  const [generatingResume, setGeneratingResume] = useState(false);

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
        duration: 2000,
      });
      return;
    }
    if (uploadedResume && uploadedResume.type !== "application/pdf") {
      toast.error("Please upload a PDF file for your resume.", {
        duration: 2000,
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
      });

      const analysisData = response.data.analysis;
      if (response && response.data.analysis) {
        localStorage.setItem("resume_text", response.data.resume_text);
        localStorage.setItem("jd", response.data.job_description);
      }
      let parsedResult = JSON.parse(analysisData);

      const transformedResult: AnalysisResult = {
        score: parsedResult.resumeScore || 75,
        strengths: parsedResult.strengths || [],
        weaknesses: parsedResult.improvements || [],
        suggestions: parsedResult.recommendations || [],
        keywords: parsedResult.recommendedKeywords || [],
        matchScore: parsedResult.jobMatchScore || 70,
        missingKeywords: parsedResult.missingKeywords || [],
        recommendedKeywords: parsedResult.recommendedKeywords || [],
      };

      toast.success("Resume analysis successful!", {
        duration: 2000,
      });

      setAnalysisResult(transformedResult);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze resume. Please try again.", {
        duration: 2000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateResumeTemplate = async () => {
    try {
      setGeneratingResume(true);
      const response = await api.post(
        "/resume/generate-resume",
        {
          resume_type: resumeMode,
          resume_text: localStorage.getItem("resume_text"),
          job_description: jobDescription,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response && response.data.aiGeneratedResume) {
        setAiGeneratedResumeHtml(
          transformResumeHtml(response.data.aiGeneratedResume)
        );
        toast.success("Resume Generated successfully!", {
          duration: 2000,
        });
        setShowTemplate(true);
        if (editableDivRef.current) {
          editableDivRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
      setGeneratingResume(false);
    } catch (error: any) {
      setGeneratingResume(false);
      console.error("Error generating resume template:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to generate resume template. Please try again.",
        {
          duration: 2000,
        }
      );
    }
  };

  const removeResume = () => {
    setUploadedResume(null);
    setAnalysisResult(null);
    setShowTemplate(false);
    setAiGeneratedResumeHtml("");
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

  const handleDownloadPdf = () => {
    if (editableDivRef.current) {
      html2pdf().from(editableDivRef.current).save("resume.pdf");
    }
  };

  useEffect(() => {
    if (aiGeneratedResumeHtml && !isInitialized && editableDivRef.current) {
      editableDivRef.current.innerHTML = transformResumeHtml(
        aiGeneratedResumeHtml
      );
      setIsInitialized(true);
    }
  }, [aiGeneratedResumeHtml, isInitialized]);

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

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 flex flex-col min-h-[calc(100vh-4rem)] py-6">
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
        {window.innerWidth <= 480 && !uploadedResume && (
          <div>
            <h1 className="text-2xl font-bold">Resume Analyzer & Generator</h1>
            <p className="text-muted-foreground">
              Upload your resume and job description to get professional
              analysis and AI-generated resume template.
            </p>
          </div>
        )}
      </motion.div>

      {!analysisResult ? (
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
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
                  className="w-50"
                >
                  <Card style={{ width: "50%" }}>
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

                      <div className="mt-4 flex justify-center">
                        <Button
                          onClick={analyzeResume}
                          disabled={isAnalyzing || !jobDescription.trim()}
                          className="w-full"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            "Analyze Resume vs Job Description"
                          )}
                        </Button>
                      </div>

                      {isAnalyzing && (
                        <div className="mt-4">
                          <p className="text-sm text-center mb-2">
                            Analyzing your resume against the job description...
                          </p>
                          <Progress value={45} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
            <Card className="md:col-span-1">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-base font-semibold">
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 pt-2">
                {/* Resume Score */}
                <div className="flex flex-row items-center justify-center gap-8 py-2">
                  {/* Resume Score */}
                  <div className="flex flex-col items-center">
                    <h3 className="font-medium text-sm mb-1">Resume Score</h3>
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
                        <circle
                          className="text-primary stroke-current transition-all duration-500"
                          strokeWidth="7"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 40 * (1 - analysisResult.score / 100)
                          }`}
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <span className="absolute text-2xl font-bold text-primary">
                        {analysisResult.score}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      {analysisResult.score >= 80
                        ? "Excellent!"
                        : analysisResult.score >= 60
                        ? "Good, but can improve."
                        : "Needs improvement."}
                    </p>
                  </div>
                  {/* Job Match Score */}
                  <div className="flex flex-col items-center">
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
                        <circle
                          className="text-green-500 stroke-current transition-all duration-500"
                          strokeWidth="7"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            40 *
                            (1 - analysisResult.matchScore / 100)
                          }`}
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <span className="absolute text-2xl font-bold text-green-600">
                        {analysisResult.matchScore}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      Job match
                    </p>
                  </div>
                </div>
                {/* Missing Keywords */}
                <div>
                  <h3 className="font-medium text-xs mb-1">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.missingKeywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="text-xs px-2 py-0.5"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* Recommended Keywords */}
                <div>
                  <h3 className="font-medium text-xs mb-1">Recommended</h3>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.recommendedKeywords.map(
                      (keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 py-0.5"
                        >
                          {keyword}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
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
                      <Button
                        variant="default"
                        onClick={() => {
                          generateResumeTemplate();
                        }}
                        type="button"
                        className="w-full mt-3"
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
                            Generate AI powered resume.
                          </>
                        )}
                      </Button>
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
                              tailored to the job description, which may include
                              skills and content inferred from the JD and your
                              uploaded resume. Please review and edit the
                              generated resume to ensure it accurately reflects
                              your real experience and skills.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 font-medium mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2 pl-7 list-disc">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 font-medium mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2 pl-7 list-disc">
                    {analysisResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Recommendations</h3>
                  <ul className="space-y-3 pl-7 list-decimal">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {showTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      AI Generated Resume Template
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPdf}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={
                        selectedTemplate === "modern" ? "default" : "outline"
                      }
                      onClick={() => {
                        setSelectedTemplate("modern");
                        setIsInitialized(false);
                      }}
                    >
                      Modern
                    </Button>
                    {/* <Button
                      variant={
                        selectedTemplate === "dark" ? "default" : "outline"
                      }
                      onClick={() => setSelectedTemplate("dark")}
                    >
                      Dark
                    </Button> */}
                    <Button
                      variant={
                        selectedTemplate === "minimal" ? "default" : "outline"
                      }
                      onClick={() => {
                        setSelectedTemplate("minimal");
                        setIsInitialized(false);
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
                        setIsInitialized(false);
                      }}
                    >
                      Classic
                    </Button>
                  </div>
                  {generatingResume ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                      <svg
                        className="animate-spin h-8 w-8 text-purple-500 mb-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="text-sm text-muted-foreground">
                        Generating your resume...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={editableDivRef}
                        className={`prose prose-sm dark:prose-invert border rounded-md p-4 bg-background text-foreground min-h-[400px] transition-colors duration-300 border-muted ${
                          selectedTemplate === "modern"
                            ? "resume-template-modern"
                            : selectedTemplate === "dark"
                            ? "resume-template-dark"
                            : selectedTemplate === "minimal"
                            ? "resume-template-minimal"
                            : "resume-template-classic"
                        }`}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onInput={(e) => {
                          setAiGeneratedResumeHtml(e.currentTarget.innerHTML);
                        }}
                        style={{ outline: "none", cursor: "text" }}
                      />
                      <div className="text-xs text-muted-foreground mt-2">
                        Click and edit your resume above. When ready, click
                        "Download PDF".
                      </div>
                    </>
                  )}
                </CardContent>
                <Toaster position="top-right" />
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
