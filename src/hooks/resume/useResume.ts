import { useMutation } from "@tanstack/react-query";
import { resumeService, CompareResumeRequest, CompareResumeResponse } from "@/services/resume/resumeService";

export const useCompareResumeJD = () => {
  return useMutation<CompareResumeResponse, Error, CompareResumeRequest>({
    mutationFn: (data) => resumeService.compareResumeJD(data),
  });
};

