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
  MessageSquare,
  Plus,
  Menu,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@radix-ui/react-dropdown-menu";
// import { CardHeader } from "../ui/card";
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
import { useChatSessions } from "@/hooks/chat/useChatSessions";
import { useSendMessage } from "@/hooks/chat/useSendMessage";
import { useSessionMessages } from "@/hooks/chat/useSessionMessages";
import { useDeleteSession } from "@/hooks/chat/useDeleteSession";

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../lib/firebase";
import { useCurrentSession, Message } from "../CurrentSession";
import { auth } from "@/lib/firebase";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  category: "openai" | "undi95" | "mistral" | "gryphe" | "google" | "deepseek";
}

import type { Session } from "@/services/chat/chatService";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // React Query hooks
  const { data: sessionsData, isLoading: isLoadingSessions } = useChatSessions(50);
  const sessions = sessionsData?.sessions || [];
  const sendMessageMutation = useSendMessage();
  const deleteSessionMutation = useDeleteSession();
  const { data: sessionMessagesData } = useSessionMessages(currentSessionId);

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

  // Load messages from API when session changes
  useEffect(() => {
    if (sessionMessagesData?.messages) {
      const loadedMessages: Message[] = sessionMessagesData.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender === "user" ? "user" : "assistant",
      }));
      setMessages(loadedMessages);
      setIsChatStarted(loadedMessages.length > 0);
    } else if (currentSessionId && !sessionMessagesData) {
      // Clear messages if session exists but no data yet (loading state)
      setMessages([]);
      setIsChatStarted(false);
    }
  }, [sessionMessagesData, currentSessionId]);

  const handleSessionClick = (session: Session) => {
    setCurrentSessionId(session.session_id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent session click
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      console.log("Deleting session:", sessionToDelete);
      await deleteSessionMutation.mutateAsync(sessionToDelete);
      toast.success("Session deleted successfully", { duration: 2000 });
      
      // If deleted session was current, clear it
      if (currentSessionId === sessionToDelete) {
        setCurrentSessionId("");
        setMessages([]);
        setIsChatStarted(false);
      }
      
      // setDeleteDialogOpen(false);
      setSessionToDelete(null);
    } catch (error: any) {
      console.error("Error deleting session:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to delete session";
      toast.error(errorMessage, { duration: 2000 });
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId("");
    setMessages([]);
    setIsChatStarted(false);
  };

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
    if (!profile?.id) {
      throw new Error("User profile not loaded. Please wait and try again.");
    }

    const session_id = uuidv4();
    const session_ref = doc(db, "sessions", session_id);

    // Step 1: Create session doc with session_name

    await setDoc(session_ref, {
      session_id,
      user_id: profile.id,
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
    
    if (!profile?.id) {
      toast.error("User profile not loaded. Please wait and try again.", {
        duration: 2000,
      });
      return;
    }

    // Create new session if one doesn't exist
    let sessionId = currentSessionId;
    if (!sessionId) {
      const sessionName = generateSessionName(input);
      sessionId = await startNewSession(sessionName, input);
      setCurrentSessionId(sessionId);
      setIsChatStarted(true);
    }

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
      sessionId,
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
    const sessionRef = doc(db, "sessions", sessionId);
    const messageInput = input; // Save input before clearing
    await updateDoc(sessionRef, {
      last_message: messageInput,
      updated_at: serverTimestamp(),
    });

    setInput("");

    try {
      const response = await sendMessageMutation.mutateAsync({
        user_id: profile.id,
        message: messageInput,
        model_name: selectedModel,
        session_id: sessionId,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response?.reply || "Sorry, I couldn't process your request.",
        sender: "assistant",
      };
      setGotResponse(true);
      setTimeout(() => {
        setGotResponse(false);
      }, 1000);
      setMessages((prev) => [...prev, aiMessage]);

      await addDoc(messagesRef, {
        id: uuidv4(),
        content: response?.reply,
        sender: "assistant",
        timestamp: serverTimestamp(),
        type: "text",
      });

      await updateDoc(sessionRef, {
        last_message: response?.reply,
        updated_at: serverTimestamp(),
      });
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


  function getTypingIndicator(messageId: string) {
    if (!isLoading) return false;
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage &&
      lastMessage.id === messageId &&
      lastMessage.sender === "assistant"
    );
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getSessionTitle = (session: Session) => {
    if (session.session_name) {
      return session.session_name;
    }
    if (session.message_count === 0) return "New Chat";
    const date = new Date(session.created_at);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Chat from ${dateStr}`;
  };

  const generateSessionName = (message: string): string => {
    // Truncate message to 50 characters for session name
    const maxLength = 50;
    const trimmed = message.trim();
    if (trimmed.length <= maxLength) {
      return trimmed;
    }
    return trimmed.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <motion.div
        initial={{ width: sidebarOpen ? 300 : 0 }}
        animate={{ width: sidebarOpen ? 300 : 0 }}
        className={`border-r border-border bg-background overflow-hidden flex flex-col ${
          sidebarOpen ? "" : "hidden md:flex"
        }`}
      >
        <div className="p-4 border-b border-border">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div
          className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted scrollbar-track-transparent"
          style={{ scrollbarWidth: "thin" }}
        >
          {isLoadingSessions ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm p-4">
              No chat history yet
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`group relative w-full text-left p-3 rounded-lg transition-colors hover:bg-muted ${
                    currentSessionId === session.session_id
                      ? "bg-muted border border-primary"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => handleSessionClick(session)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getSessionTitle(session)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(session.updated_at)}
                          </p>
                          {session.message_count > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(e, session.session_id)}
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={deleteSessionMutation.isPending}
                    title="Delete session"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col chatbot-main-container relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10 md:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Card
          className="flex-1 overflow-hidden flex flex-col card-container border-none h-full"
        >
        <CardContent
          ref={chatContainerRef}
          className="card-inner-container flex-1 p-4 overflow-y-auto space-y-4 flex flex-col"
          style={{ scrollbarWidth: "none" }}
        >
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Welcome{profile?.name ? `, ${profile.name}` : ""}! 👋
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  I&apos;m here to help with your questions, ideas, and projects.
                </p>
                <p className="text-sm text-muted-foreground">
                  Select a session from the sidebar or just start typing to begin a new chat.
                </p>
              </div>
            </div>
          ) : (
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
                  className={`message-item flex gap-3 max-w-[90%] ${
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

                  <div style={{ maxWidth: "100%" }}>
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
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div
          className="p-4 input-element-container"
          style={{ position: "relative" }}
        >
          {/* {window.innerWidth <= 480 && (
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
          )} */}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2">
              {/* {window.innerWidth > 480 && (
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
              )} */}
              {/* <input
                type="file"
                id="chat-file-upload"
                style={{ display: "none" }}
                multiple={false}
                disabled={isLoading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // You can handle the file upload here, e.g., send to backend or display a preview
                  toast.loading("Uploading file...", { id: "file-upload" });
                  try {
                    // Example: convert file to base64 (or send as FormData to backend)
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const fileData = event.target?.result;
                      // Here you could send fileData to your backend or handle as needed
                      // For demonstration, just append a message with file name
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: uuidv4(),
                          sender: "user",
                          content: `Uploaded file: ${file.name}`,
                          createdAt: new Date().toISOString(),
                        },
                      ]);
                      toast.success("File uploaded!", { id: "file-upload" });
                    };
                    reader.onerror = () => {
                      toast.error("Failed to read file.", {
                        id: "file-upload",
                      });
                    };
                    reader.readAsDataURL(file);
                  } catch (err) {
                    toast.error("File upload failed.", { id: "file-upload" });
                  } finally {
                    e.target.value = "";
                  }
                }}
              /> */}
              {/* <Button
                type="button"
                variant="outline"
                className="shrink-0"
                disabled={isLoading}
                onClick={() => {
                  document.getElementById("chat-file-upload")?.click();
                }}
                title="Attach file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.071-7.071a4 4 0 10-5.657-5.657l-8.485 8.485a6 6 0 108.485 8.485l6.364-6.364"
                  />
                </svg>
                <span className="sr-only">Attach file</span>
              </Button> */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open: boolean) => {
          // Prevent closing during API call
          if (!open && deleteSessionMutation.isPending) {
            return;
          }
          setDeleteDialogOpen(open);
          if (!open) {
            setSessionToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone and all messages in this session will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                if (!deleteSessionMutation.isPending) {
                  setDeleteDialogOpen(false);
                  setSessionToDelete(null);
                }
              }}
              disabled={deleteSessionMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
