import { useMutation } from "@tanstack/react-query";
import { resumeService, CompareResumeRequest, CompareResumeResponse, GenerateResumeRequest, GenerateResumeResponse, GeneratePDFRequest } from "@/services/resume/resumeService";

export const useCompareResumeJD = () => {
  return useMutation<CompareResumeResponse, Error, CompareResumeRequest>({
    mutationFn: (data) => resumeService.compareResumeJD(data),
  });
};

export const useGenerateResume = () => {
  return useMutation<GenerateResumeResponse, Error, GenerateResumeRequest>({
    mutationFn: (data) => resumeService.generateResume(data),
  });
};

export const useGeneratePDF = () => {
  return useMutation<Blob, Error, GeneratePDFRequest>({
    mutationFn: (data) => resumeService.generatePDF(data),
  });
};

