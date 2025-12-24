import { useMutation } from "@tanstack/react-query";
import { resumeService, CompareResumeRequest, CompareResumeResponse, GenerateResumeRequest, GenerateResumeResponse } from "@/services/resume/resumeService";

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

