import api from "@/lib/api";

export interface HelpQuery {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  reply: string | null;
}

export interface SubmitQueryRequest {
  subject: string;
  message: string;
}

export interface ReplyQueryRequest {
  query_id: string;
  reply: string;
}

export const helpService = {
  // User: Submit a new support query
  submitQuery: async (data: SubmitQueryRequest): Promise<HelpQuery> => {
    const response = await api.post("/help/queries", data);
    return response.data;
  },

  // User: View my own submitted queries
  getMyQueries: async (): Promise<HelpQuery[]> => {
    const response = await api.get("/help/queries");
    return response.data; // Returns array directly
  },

  // Admin: View ALL user queries (optional status filter)
  getAllQueries: async (status?: string): Promise<HelpQuery[]> => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get(`/help/queries/all${params}`);
    return response.data; // Returns array directly
  },

  // Admin: Reply to a specific query
  replyToQuery: async (data: ReplyQueryRequest): Promise<HelpQuery> => {
    const response = await api.post(`/help/queries/${data.query_id}/reply`, {
      reply: data.reply,
    });
    return response.data;
  },

  // Admin: Change ticket status
  updateQueryStatus: async (queryId: string, status: string): Promise<HelpQuery> => {
    const response = await api.patch(`/help/queries/${queryId}/status`, {
      status,
    });
    return response.data;
  },
};

