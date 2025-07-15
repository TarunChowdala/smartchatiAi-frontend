import type React from "react";
import "./styles.css";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Loader2, Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import axios from "axios";
import api from "@/lib/api";
import MessageContent from "../chat/MessageContent";
import toast, { Toaster } from "react-hot-toast";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export default function DocumentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setActiveTab("chat");
    setIsLoading(true);
    setError("");

    setUploadingDocument(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          "File size exceeds 10MB limit. Please upload a smaller file.",
          {
            duration: 2000,
            position: "top-right",
            style: {
              background: "#333",
              color: "#fff",
            },
          }
        );
        setUploadedFile(null);
        setError("File size exceeds 10MB limit");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      const response = await api.post("/document/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          withCredentials: true,
        },
      });

      setUploadingDocument(false);

      if (response.status === 200) {
        toast.success("File uploaded successfully.", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });

        const aiMessage: Message = {
          id: Date.now().toString(),
          content: `I've analyzed "${file.name}". What would you like to know about this document?`,
          role: "assistant",
        };
        setMessages([aiMessage]);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setUploadingDocument(false);

      if (err.response) {
        const errorMessage =
          err.response.data?.details ||
          err.response.data?.message ||
          "Failed to upload file";
        toast.error(errorMessage, {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      } else {
        toast.error("Network error. Please check your connection.", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      }

      setUploadedFile(null);
      setActiveTab("upload");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !uploadedFile) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/document/ask", {
        question: input,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.answer,
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Error:", err);

      // Handle Axios error response
      if (err.response) {
        const errorMessage =
          err.response.data?.detail || "Something went wrong";
        toast.error(errorMessage, {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });

        // Add error message to chat
        const errorMessageObj: Message = {
          id: (Date.now() + 1).toString(),
          content: errorMessage,
          role: "assistant",
        };
        setMessages((prev) => [...prev, errorMessageObj]);
      } else {
        // Handle network or other errors
        const errorMessage = "Network error. Please check your connection.";
        toast.error(errorMessage, {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#333",
            color: "#fff",
          },
        });

        const errorMessageObj: Message = {
          id: (Date.now() + 1).toString(),
          content: errorMessage,
          role: "assistant",
        };
        setMessages((prev) => [...prev, errorMessageObj]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setMessages([]);
    setActiveTab("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`w-full px-4 md:px-6 lg:px-8 flex flex-col h-[calc(100vh-4rem)] py-6 ${
        uploadedFile ? "chatbot-main-container" : ""
      }`}
    >
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 flex justify-between items-center"
      >
        {window.innerWidth > 480 && (
          <div>
            <h1 className="text-2xl font-bold">Document Chat</h1>
            <p className="text-muted-foreground">
              Upload a document and chat about its contents.
            </p>
          </div>
        )}
        {/* {window.innerWidth <= 480 && !uploadedFile && (
          <div>
            <h1 className="text-2xl font-bold">Document Chat</h1>
            <p className="text-muted-foreground">
              Upload a document and chat about its contents.
            </p>
          </div>
        )} */}

        {uploadedFile && (
          <Button
            variant="outline"
            onClick={removeFile}
            className="flex items-center gap-2 upload-button"
          >
            <Upload className="h-4 w-4" />
            New Document
          </Button>
        )}
      </motion.div>

      <Card
        className={`flex-1 overflow-hidden flex flex-col ${
          uploadedFile ? "document-chat-card-container" : ""
        }`}
      >
        {!uploadedFile ? (
          <CardContent className="flex flex-col items-center justify-center h-full p-6 sma upload document-upload-card-inner-container">
            <div className="w-full max-w-md flex flex-col items-center justify-center p-6 sm:p-4 border-2 border-dashed rounded-lg">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Supports PDF, DOCX, TXT (Max 10MB)
              </p>
              <div className="relative">
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  id="file-upload"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            <div className="p-3 bg-muted flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(uploadedFile.size / 1024)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent
              className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                uploadedFile ? "document-chat-card-inner-container" : ""
              }`}
              style={{
                maxHeight: "calc(100vh - 313px)",
                scrollbarWidth: "none",
              }}
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`message-item flex gap-3 max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      {window.innerWidth > 480 && (
                        <Avatar className="h-8 w-8">
                          {message.role === "user" ? (
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

                      <div
                        className={`rounded-lg px-2 ${
                          message.role === "user"
                            ? "bg-muted text-foreground"
                            : "message-item-bot"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="p-2">{message.content}</p>
                        ) : (
                          <MessageContent content={message.content} />
                        )}
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
                      {window.innerWidth > 480 && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/botIcon.png" />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      {uploadingDocument && (
                        <div className="rounded-lg px-4 py-3 bg-muted">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <div>
                              <p className="font-medium">
                                Uploading your document
                              </p>
                              <p className="text-sm text-muted-foreground">
                                This may take a moment
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {!uploadingDocument && isLoading && (
                        <div className="rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-4 border-t input-element-container">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the document..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
