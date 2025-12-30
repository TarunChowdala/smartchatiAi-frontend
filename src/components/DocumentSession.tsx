import { createContext, useState, useContext, ReactNode } from "react";

export type DocumentMessage = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

interface DocumentSessionContextType {
  currentDocumentId: string | null;
  setCurrentDocumentId: (documentId: string | null) => void;
  messages: DocumentMessage[];
  setMessages: React.Dispatch<React.SetStateAction<DocumentMessage[]>>;
  uploadedFileName: string | null;
  setUploadedFileName: (fileName: string | null) => void;
}

export const DocumentSessionContext = createContext<
  DocumentSessionContextType | undefined
>(undefined);

export const DocumentSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DocumentMessage[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  return (
    <DocumentSessionContext.Provider
      value={{
        currentDocumentId,
        setCurrentDocumentId,
        messages,
        setMessages,
        uploadedFileName,
        setUploadedFileName,
      }}
    >
      {children}
    </DocumentSessionContext.Provider>
  );
};

export const useDocumentSession = () => {
  const context = useContext(DocumentSessionContext);
  if (context === undefined) {
    throw new Error(
      "useDocumentSession must be used within a DocumentSessionProvider"
    );
  }
  return context;
};

