import type React from "react";
import "./styles.css";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  // Loader2,
  // MoreVertical,
  // Pencil,
  // Trash2,
  // Pause,
  // Play,
  // Speaker,
  // Volume2,
  Copy,
  Check,
  ChevronDown,
  // Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
// import { CardHeader } from "../ui/card";
import api from "@/lib/api";
import MessageContent from "./MessageContent";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@radix-ui/react-select";
import toast, { Toaster } from "react-hot-toast";
import { useProfile } from "../ProfileContext";

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../lib/firebase";
import { useCurrentSession, Message } from "../CurrentSession";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  category: "openai" | "undi95" | "mistral" | "gryphe" | "google" | "deepseek";
}

const modelsList: ModelOption[] = [
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    description: "A fast and powerful open-source model for everyday tasks.",
    category: "mistral",
  },
  {
    id: "deepseek/deepseek-chat:free",
    name: "DeepSeek",
    description:
      "Great for coding, chatting, and multilingual tasks. Open-source and reliable.",
    category: "deepseek",
  },
  // {
  //   id: "gryphe/mythomist-7b:free",
  //   name: "MythoMist 7B",
  //   description:
  //     "Perfect for writing stories, creative tasks, and casual chat.",
  //   category: "gryphe",
  // },
  // {
  //   id: "undi95/toppy-m-7b:free",
  //   name: "Toppy M 7B",
  //   description: "Fast model designed for fun conversations and roleplay.",
  //   category: "undi95",
  // },
];

export default function ChatPage() {
  const { profile } = useProfile();
  const {
    currentSessionId,
    setCurrentSessionId,
    messages,
    setMessages,
    isChatStarted,
    setIsChatStarted,
  } = useCurrentSession();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  // const [selectedVoice, setSelectedVoice] =
  //   useState<SpeechSynthesisVoice | null>(null);
  const [selectedModel, setSelectedModel] = useState(
    "mistralai/mistral-7b-instruct:free"
  );
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  // const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [gotResponse, setGotResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // const [chatHistory, setChatHistory] = useState([
  //   {
  //     id: 1,
  //     title: "General Questions",
  //     timestamp: "2024-03-15T10:30:00",
  //   },
  //   {
  //     id: 2,
  //     title: "Project Discussion",
  //     timestamp: "2024-03-14T15:45:00",
  //   },
  //   { id: 3, title: "Code Review", timestamp: "2024-03-13T09:15:00" },
  // ]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const scrollHeight = container.scrollHeight;
      const height = container.clientHeight;
      const maxScrollTop = scrollHeight - height;

      container.scrollTo({
        top: maxScrollTop,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize and select the best voice
  // useEffect(() => {
  //   const loadVoices = () => {
  //     const voices = window.speechSynthesis.getVoices();
  //     // Try to find the best Windows voice
  //     const preferredVoice =
  //       voices.find(
  //         (voice) =>
  //           // Prefer Microsoft voices
  //           voice.name.includes("Microsoft") &&
  //           // Prefer English voices
  //           voice.lang.includes("en") &&
  //           // Prefer female voices
  //           voice.name.includes("Female")
  //       ) ||
  //       voices.find(
  //         (voice) =>
  //           // Fallback to any Microsoft voice
  //           voice.name.includes("Microsoft") && voice.lang.includes("en")
  //       ) ||
  //       voices[0]; // Last resort: first available voice

  //     if (preferredVoice) {
  //       setSelectedVoice(preferredVoice);
  //     }
  //   };

  //   loadVoices();
  //   if (window.speechSynthesis.onvoiceschanged !== undefined) {
  //     window.speechSynthesis.onvoiceschanged = loadVoices;
  //   }
  // }, []);

  const startNewSession = async (session_name: any, message: any) => {
    const session_id = uuidv4();
    const session_ref = doc(db, "sessions", session_id);

    // Step 1: Create session doc with session_name
    await setDoc(session_ref, {
      session_id,
      user_id: profile?.id,
      session_name,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_message: message,
    });

    // Step 2: Add first message to subcollection
    const messagesRef = collection(session_ref, "messages");
    await addDoc(messagesRef, {
      content: message,
      sender: "user",
      timestamp: serverTimestamp(),
      type: "text",
    });

    return session_id;
  };

  // sending message to llm
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    //storing usermessage in current session
    const messagesRef = collection(
      db,
      "sessions",
      currentSessionId,
      "messages"
    );
    await addDoc(messagesRef, {
      id: uuidv4(),
      content: input,
      sender: "user",
      timestamp: serverTimestamp(),
      type: "text",
    });

    //Updating the current session with latest info
    const sessionRef = doc(db, "sessions", currentSessionId);
    await updateDoc(sessionRef, {
      last_message: input,
      updated_at: serverTimestamp(),
    });

    setInput("");

    try {
      const response = await api.post("/chat/send-message", {
        user_id: profile?.id,
        message: input,
        model_name: selectedModel,
        session_id: currentSessionId,
      });
      // console.log(response, "response");
      if (response.status === 200) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            response?.data?.reply || "Sorry, I couldn't process your request.",
          sender: "assistant",
        };
        setGotResponse(true);
        setTimeout(() => {
          setGotResponse(false);
        }, 1000);
        setMessages((prev) => [...prev, aiMessage]);

        await addDoc(messagesRef, {
          id: uuidv4(),
          content: response?.data?.reply,
          sender: "assistant",
          timestamp: serverTimestamp(),
          type: "text",
        });

        await updateDoc(sessionRef, {
          last_message: response?.data?.reply,
          updated_at: serverTimestamp(),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage, {
        duration: 2000,
      });

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: "assistant",
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (session_name: any, firstMessage: any) => {
    const sessionId = await startNewSession(session_name, firstMessage);
    setCurrentSessionId(sessionId);
    setIsChatStarted(true);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 100);
  };

  if (!isChatStarted) {
    const suggestedPrompts = [
      {
        id: 1,
        text: "What can you help me with?",
        label: "General Help",
        icon: "💡",
        description: "Let me show you what I can do",
      },
      {
        id: 2,
        text: "Can you help me write some code?",
        label: "Code Assistance",
        icon: "👨‍💻",
        description: "I'll help you with your coding tasks",
      },
      {
        id: 3,
        text: "Can you explain something to me?",
        label: "Explanation",
        icon: "📚",
        description: "I'll break it down in simple terms",
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4"
      >
        <div className="text-center max-w-xl w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-xl md:text-2xl font-bold mb-2">
              Hey {profile?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              I'm here to help! What would you like to chat about?
            </p>
          </motion.div>

          <div className="grid gap-3 w-full">
            {suggestedPrompts.map((prompt, index) => (
              <motion.button
                key={prompt.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => {
                  setInput(prompt.text);
                  handleStartChat(prompt.label, prompt.text);
                }}
                className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 w-full text-left"
              >
                <span className="text-base">{prompt.icon}</span>
                <div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                    {prompt.text}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {prompt.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  function getTypingIndicator(messageId: string) {
    if (!isLoading) return false;
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage &&
      lastMessage.id === messageId &&
      lastMessage.sender === "assistant"
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 flex flex-col py-6 chatbot-main-container">
      <Toaster />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4"
      >
        {window.innerWidth > 480 && (
          <>
            <h1 className="text-2xl font-bold">AI Chat</h1>
            <p className="text-muted-foreground">
              Chat with our AI assistant about anything.
            </p>
          </>
        )}
      </motion.div>
      <Card
        className="flex-1 overflow-hidden flex flex-col card-container"
        style={{ maxHeight: "calc(100vh - 8rem)" }}
      >
        <CardContent
          ref={chatContainerRef}
          className="card-inner-container flex-1 p-4 overflow-y-auto space-y-4"
          style={{ scrollbarWidth: "none" }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`message-item flex gap-3 max-w-[80%] ${
                    message.sender === "user"
                      ? "flex-row-reverse"
                      : "message-item-bot"
                  }`}
                >
                  {window.innerWidth > 480 && (
                    <Avatar className="h-8 w-8">
                      {message.sender === "user" ? (
                        <>
                          <AvatarImage src="/userIcon.png" />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/botIcon.png" />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  )}

                  <div>
                    <div
                      className={`rounded-lg px-2 ${
                        message.sender === "user"
                          ? "bg-muted text-foreground"
                          : ""
                      }`}
                    >
                      {message.sender === "user" ? (
                        <p className="p-2 text-sm md:text-base">
                          {message.content}
                        </p>
                      ) : (
                        <MessageContent
                          content={message.content}
                          enableTyping={getTypingIndicator(message.id)}
                        />
                      )}
                    </div>

                    <div className="flex gap-2 self-end p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          toast.success("Message copied to clipboard!", {
                            duration: 2000,
                          });
                          e.stopPropagation();
                          navigator.clipboard.writeText(message.content);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy message</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/botIcon.png" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>
        <div
          className="p-4 border-t input-element-container"
          style={{ position: "relative" }}
        >
          {window.innerWidth <= 480 && (
            <div className="flex items-center gap-2 md:hidden">
              <DropdownMenu
                open={isModelMenuOpen}
                onOpenChange={setIsModelMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-muted hover:bg-muted/80"
                    style={{ position: "absolute", top: "-40px", left: "5px" }}
                  >
                    <Bot
                      className={`h-4 w-4 transition-all duration-200 ease-in-out ${
                        isModelMenuOpen ? "scale-110" : "scale-100"
                      }`}
                    />
                    <span className="sr-only">Select model</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[280px] bg-background border shadow-md p-2 rounded-md"
                  sideOffset={5}
                >
                  {modelsList.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className="flex flex-col items-start gap-1 p-2 hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{model.name}</span>
                        {selectedModel === model.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2">
              {window.innerWidth > 480 && (
                <DropdownMenu
                  open={isModelMenuOpen}
                  onOpenChange={setIsModelMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[145px] justify-between shrink-0"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {modelsList.find((m) => m.id === selectedModel)?.name ||
                          "Select Model"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isModelMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[280px] bg-background border shadow-md p-2 rounded-md"
                    sideOffset={5}
                  >
                    {modelsList.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className="flex flex-col items-start gap-1 p-2 hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{model.name}</span>
                          {selectedModel === model.id && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInput(e.target.value)
                }
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
