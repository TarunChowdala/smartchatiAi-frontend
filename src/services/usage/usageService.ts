import api from "@/lib/api";

export interface UsageDetail {
  current: number;
  limit: number | "unlimited";
}

export interface UsageData {
  sessions: UsageDetail;
  documents: UsageDetail;
  resumes: UsageDetail;
  messages_per_session_limit: number | "unlimited";
}

export interface UserUsageItem {
  user_id: string;
  role: string;
  email?: string;
  name?: string;
  usage: UsageData;
}

export type MyUsageResponse = UserUsageItem;

export type AllUsersResponse = UserUsageItem[];

export type UserUsageResponse = UserUsageItem;

export const usageService = {
  getMyUsage: async (): Promise<MyUsageResponse> => {
    const response = await api.get("/usage/my-usage");
    return response.data; // Returns { user_id, role, usage: {...}, email, name }
  },

  getAllUsers: async (limit: number = 50): Promise<AllUsersResponse> => {
    const response = await api.get(`/usage/all-users?limit=${limit}`);
    return response.data; // Returns array of users directly: [{ user_id, role, usage, email, name }, ...]
  },

  resetUserUsage: async (userId: string): Promise<void> => {
    await api.post(`/usage/reset/${userId}`);
  },

  getUserUsage: async (userId: string): Promise<UserUsageResponse> => {
    const response = await api.get(`/usage/user-usage/${userId}`);
    return response.data; // Returns { user_id, role, usage: {...}, email, name }
  },
};

