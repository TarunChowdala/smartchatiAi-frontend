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
};

