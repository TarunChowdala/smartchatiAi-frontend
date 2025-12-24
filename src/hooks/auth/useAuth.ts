import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, LoginRequest, SignupRequest, GoogleSignupRequest, User, UpdateMeRequest, UpdatePasswordRequest } from "@/services/auth/authService";

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

