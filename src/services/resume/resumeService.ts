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

export interface GeneratePDFRequest {
  template_id: "modern" | "minimal" | "classic";
  resume_data: {
    basics?: {
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
    summary?: {
      headline?: string;
      highlights?: string[];
    };
    experience?: Array<{
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
    }>;
    projects?: Array<{
      name: string;
      type?: string;
      link?: string;
      description?: string;
      highlights?: string[];
      tech_stack?: string[];
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      location?: string;
      start_date?: string;
      end_date?: string;
      gpa?: string;
      highlights?: string[];
    }>;
    skills?: {
      categories?: Array<{
        name: string;
        items: string[];
      }>;
    };
    certifications?: string[];
    achievements?: string[];
  };
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
  generatePDF: async (data: GeneratePDFRequest): Promise<Blob> => {
    const response = await api.post(
      "/resume/download?format=pdf",
      {
        template_id: data.template_id,
        resume_data: data.resume_data,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "blob",
        timeout: 180000, // 3 minutes timeout
      }
    );
    return response.data;
  },
};

