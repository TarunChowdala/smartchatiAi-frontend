import api from "@/lib/api";

export interface UploadDocumentRequest {
  file: File;
}

export interface UploadDocumentResponse {
  document_id: string;
}

export interface DocumentStatusResponse {
  ready: boolean;
}

export interface AskDocumentRequest {
  document_id: string;
  question: string;
}

export interface AskDocumentResponse {
  answer: string;
}

export const documentService = {
  uploadDocument: async (file: File): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/document/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getDocumentStatus: async (documentId: string): Promise<DocumentStatusResponse> => {
    const response = await api.get(`/document/${documentId}/status`);
    return response.data;
  },

  askDocument: async (data: AskDocumentRequest): Promise<AskDocumentResponse> => {
    const response = await api.post("/document/ask", {
      question: data.question,
      task_id: data.document_id, // Backend expects task_id
    });
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/document/${documentId}`);
  },
};

