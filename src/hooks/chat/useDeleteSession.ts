import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat/chatService";

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId) => chatService.deleteSession(sessionId),
    onSuccess: () => {
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
      // Invalidate messages query for the deleted session
      queryClient.invalidateQueries({ queryKey: ["chat", "session"] });
    },
  });
};

