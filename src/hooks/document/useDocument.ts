import { useMutation, useQuery } from "@tanstack/react-query";
import { documentService, UploadDocumentResponse, DocumentStatusResponse, AskDocumentRequest, AskDocumentResponse } from "@/services/document/documentService";

export const useUploadDocument = () => {
  return useMutation<UploadDocumentResponse, Error, File>({
    mutationFn: (file) => documentService.uploadDocument(file),
  });
};

export const useDocumentStatus = (documentId: string | null, enabled: boolean = false) => {
  return useQuery<DocumentStatusResponse>({
    queryKey: ["document", "status", documentId],
    queryFn: () => documentService.getDocumentStatus(documentId!),
    enabled: enabled && !!documentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.ready) {
        return false; // Stop polling when ready
      }
      return 20000; // Poll every 20 seconds
    },
  });
};

export const useAskDocument = () => {
  return useMutation<AskDocumentResponse, Error, AskDocumentRequest>({
    mutationFn: (data) => documentService.askDocument(data),
  });
};

export const useDeleteDocument = () => {
  return useMutation<void, Error, string>({
    mutationFn: (documentId) => documentService.deleteDocument(documentId),
  });
};

