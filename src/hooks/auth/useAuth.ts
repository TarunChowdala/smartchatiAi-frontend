import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, LoginRequest, SignupRequest, GoogleSignupRequest, User, UpdateMeRequest, UpdatePasswordRequest, GeminiApiKeyResponse } from "@/services/auth/authService";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
  });
};

export const useGoogleSignup = () => {
  return useMutation({
    mutationFn: (data: GoogleSignupRequest) => authService.googleSignup(data),
  });
};

export const useGetMe = () => {
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getMe(),
    enabled: !!localStorage.getItem("token"),
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateMeRequest>({
    mutationFn: (data) => authService.updateMe(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation<void, Error, UpdatePasswordRequest>({
    mutationFn: (data) => authService.updatePassword(data),
  });
};

export const useGetGeminiApiKey = () => {
  return useQuery<GeminiApiKeyResponse>({
    queryKey: ["auth", "settings", "gemini-api-key"],
    queryFn: () => authService.getGeminiApiKey(),
    enabled: !!localStorage.getItem("token"),
  });
};

export const useSetGeminiApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<GeminiApiKeyResponse, Error, string>({
    mutationFn: (gemini_api_key) => authService.setGeminiApiKey(gemini_api_key),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "settings", "gemini-api-key"], {
        ...data,
        has_key: data?.has_key ?? true,
        has_gemini_key: data?.has_gemini_key ?? true,
      });
    },
  });
};

export const useDeleteGeminiApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.deleteGeminiApiKey(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "settings", "gemini-api-key"], {});
    },
  });
};

