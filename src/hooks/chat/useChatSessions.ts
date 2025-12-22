import { useQuery } from "@tanstack/react-query";
import { chatService, SessionsResponse } from "@/services/chat/chatService";

export const useChatSessions = (limit: number = 50) => {
  return useQuery<SessionsResponse>({
    queryKey: ["chat", "sessions", limit],
    queryFn: () => chatService.getSessions(limit),
  });
};

