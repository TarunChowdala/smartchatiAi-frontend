import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import type { Components } from "react-markdown";
import { Play, Pause, Check, Copy } from "lucide-react";
import "./styles.css";

interface MessageContentProps {
  content: string;
  className?: string;
  enableTyping?: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({
  content,
  className,
  enableTyping = false,
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (enableTyping) {
      let currentIndex = 0;
      const typingSpeed = 1; // Adjust this value to control typing speed (lower = faster)

      const typeNextChar = () => {
        if (currentIndex < content.length) {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeNextChar, typingSpeed);
        } else {
          setIsTyping(false);
        }
      };

      setDisplayedContent("");
      setIsTyping(true);
      typeNextChar();

      return () => {
        // Cleanup timeout if component unmounts
        currentIndex = content.length;
      };
    } else {
      // If typing is disabled, show content immediately
      setDisplayedContent(content);
      setIsTyping(false);
    }
  }, [content, enableTyping]);

  const handlePlayPause = () => {
    if (!speech) {
      // Create new speech instance
      const newSpeech = new SpeechSynthesisUtterance(content);
      newSpeech.onend = () => setIsPlaying(false);
      setSpeech(newSpeech);
      window.speechSynthesis.speak(newSpeech);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
    }
  };

  const components: Components = {
    // Code blocks with syntax highlighting
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const [copied, setCopied] = useState(false);
      return !inline && match ? (
        <div className="relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                const codeToCopy = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                navigator.clipboard.writeText(codeToCopy).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="flex items-center gap-1 p-1 rounded bg-gray-700 text-white text-xs hover:bg-gray-600"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {/* {copied ? "Copied" : "Copy"} */}
            </button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              padding: "1rem",
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm">
          {children}
        </code>
      );
    },

    // Headings with better spacing and styling
    h1: ({ children }) => (
      <h1 className="text-xl md:text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg md:text-xl font-semibold mt-5 mb-3 text-gray-800 dark:text-gray-200">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base md:text-lg font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">
        {children}
      </h3>
    ),

    // Lists with better spacing and styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 my-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 my-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-2">{children}</li>,

    // Paragraphs with better spacing
    p: ({ children }) => (
      <p className="my-3 text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),

    // Blockquotes with better styling
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),

    // Tables with better styling
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {children}
      </td>
    ),

    // Links with better styling
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        {children}
      </a>
    ),

    // Images with better styling
    img: ({ src, alt }) => {
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState(false);

      return (
        <div className="my-4">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={src}
              alt={alt || "Image"}
              className={`rounded-lg max-w-full h-auto shadow-md transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError(true);
                setIsLoading(false);
              }}
            />
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Failed to load image
                </p>
              </div>
            )}
          </div>
          {alt && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              {alt}
            </p>
          )}
        </div>
      );
    },

    // Horizontal rule with better styling
    hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
  };

  return (
    <>
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none relative group",
          className
        )}
        style={{ maxWidth: "100%" }}
      >
        <div className="flex flex-col gap-2">
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={components}
          >
            {displayedContent}
          </ReactMarkdown>
          {isTyping && (
            <span className="inline-block w-2 h-4 bg-gray-500 dark:bg-gray-400 animate-pulse ml-1" />
          )}
        </div>
      </div>
    </>
  );
};

export default MessageContent;
