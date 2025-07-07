import { createContext, useState, useContext, ReactNode } from "react";

export type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
};

interface CurrentSessionContextType {
  currentSessionId: string;
  setCurrentSessionId: (sessionId: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isChatStarted: boolean;
  setIsChatStarted: (isChatStarted: boolean) => void;
}

export const CurrentSessionContext = createContext<
  CurrentSessionContextType | undefined
>(undefined);

export const CurrentSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatStarted, setIsChatStarted] = useState<boolean>(false);

  return (
    <CurrentSessionContext.Provider
      value={{
        currentSessionId,
        setCurrentSessionId,
        messages,
        setMessages,
        isChatStarted,
        setIsChatStarted,
      }}
    >
      {children}
    </CurrentSessionContext.Provider>
  );
};

export const useCurrentSession = () => {
  const context = useContext(CurrentSessionContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentSession must be used within a CurrentSessionProvider"
    );
  }
  return context;
};
