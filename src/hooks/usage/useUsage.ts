import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  usageService,
  MyUsageResponse,
  AllUsersResponse,
  UserUsageResponse,
} from "@/services/usage/usageService";

export const useMyUsage = () => {
  return useQuery<MyUsageResponse>({
    queryKey: ["usage", "my-usage"],
    queryFn: () => usageService.getMyUsage(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAllUsers = (limit: number = 50) => {
  return useQuery<AllUsersResponse>({
    queryKey: ["usage", "all-users", limit],
    queryFn: () => usageService.getAllUsers(limit),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useUserUsage = (userId: string | null) => {
  return useQuery<UserUsageResponse>({
    queryKey: ["usage", "user-usage", userId],
    queryFn: () => usageService.getUserUsage(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useResetUserUsage = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => usageService.resetUserUsage(userId),
    onSuccess: (_, userId) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["usage", "all-users"] });
      queryClient.invalidateQueries({ queryKey: ["usage", "user-usage", userId] });
      queryClient.invalidateQueries({ queryKey: ["usage", "my-usage"] });
    },
  });
};

