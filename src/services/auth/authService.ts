import api from "@/lib/api";
import { encryptPassword } from "@/utils/encryption";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  uid?: string;
  idToken?: string;
  about?: string;
}

export interface GoogleSignupRequest {
  idToken: string;
  email: string;
  name: string;
  uid?: string;
  profileImage?: string;
}

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  profileImage?: string;
  id?: string;
}

export interface UpdateMeRequest {
  name?: string;
  profileImage?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: encryptPassword(data.password),
    });
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/signup", {
      ...data,
      password: encryptPassword(data.password),
    });
    return response.data;
  },

  googleSignup: async (data: GoogleSignupRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/google-signup", data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateMe: async (data: UpdateMeRequest): Promise<User> => {
    const response = await api.post("/auth/update-me", data);
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<void> => {
    await api.post("/auth/update-password", {
      currentPassword: encryptPassword(data.currentPassword),
      newPassword: encryptPassword(data.newPassword),
    });
  },
};

