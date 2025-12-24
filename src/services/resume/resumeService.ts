import api from "@/lib/api";

export interface CompareResumeRequest {
  file: File;
  jobDescription: string;
}

export interface CompareResumeResponse {
  analysis: string | object;
  resume_text?: string;
  job_description?: string;
}

export interface GenerateResumeRequest {
  resume_type: string;
  resume_text: string;
  job_description: string;
}

export interface GenerateResumeResponse {
  [key: string]: any; // Response can be various formats (JSON object, nested, or HTML string)
}

export const resumeService = {
  compareResumeJD: async (data: CompareResumeRequest): Promise<CompareResumeResponse> => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("job_description", JSON.stringify(data.jobDescription));
    const response = await api.post("/resume/compare-resume-jd", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes timeout
    });
    return response.data;
  },
  generateResume: async (data: GenerateResumeRequest): Promise<GenerateResumeResponse> => {
    const response = await api.post(
      "/resume/generate-resume",
      {
        resume_type: data.resume_type,
        resume_text: data.resume_text,
        job_description: data.job_description,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000, // 3 minutes timeout for generation
      }
    );
    return response.data;
  },
};

