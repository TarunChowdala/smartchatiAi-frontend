import { useQuery } from "@tanstack/react-query";
import { chatService, SessionMessagesResponse } from "@/services/chat/chatService";

export const useSessionMessages = (sessionId: string | null, limit: number = 100) => {
  return useQuery<SessionMessagesResponse>({
    queryKey: ["chat", "session", sessionId, "messages", limit],
    queryFn: () => chatService.getSessionMessages(sessionId!, limit),
    enabled: !!sessionId,
  });
};

