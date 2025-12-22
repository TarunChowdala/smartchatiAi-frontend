import api from "@/lib/api";

export interface Session {
  session_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  session_name?: string;
}

export interface SessionsResponse {
  sessions: Session[];
  count: number;
}

export interface SendMessageRequest {
  user_id: string;
  message: string;
  model_name: string;
  session_id: string;
}

export interface SendMessageResponse {
  reply: string;
}

export interface SessionMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp?: string;
  type?: string;
}

export interface SessionMessagesResponse {
  messages: SessionMessage[];
  count?: number;
}

export const chatService = {
  getSessions: async (limit: number = 50): Promise<SessionsResponse> => {
    const response = await api.get(`/chat/sessions?limit=${limit}`);
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await api.post("/chat/send-message", data);
    return response.data;
  },

  getSessionMessages: async (sessionId: string, limit: number = 100): Promise<SessionMessagesResponse> => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages?limit=${limit}`);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/sessions/${sessionId}`);
  },
};

