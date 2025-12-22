import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, SendMessageRequest, SendMessageResponse } from "@/services/chat/chatService";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, SendMessageRequest>({
    mutationFn: (data) => chatService.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
      // Invalidate session messages to refresh messages
      queryClient.invalidateQueries({ queryKey: ["chat", "session", variables.session_id, "messages"] });
    },
  });
};

