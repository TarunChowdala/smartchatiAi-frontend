import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, FileText, FileUp } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="w-full px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Brain className="h-6 w-6" />
            <span>SmartChat AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      <div
        style={{ height: "92vh", overflowY: "auto", scrollbarWidth: "none" }}
      >
        {/* Hero Section */}
        <section className="w-full px-4 md:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your AI Assistant for{" "}
              <span className="text-primary">Everything</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              Chat, analyze documents, and get resume feedback with our powerful
              AI tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link to="/dashboard/chat">
                <Button size="lg" className="gap-2">
                  Try Chat <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard/document">
                <Button size="lg" variant="outline" className="gap-2">
                  Chat with Documents <FileText className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard/resume">
                <Button size="lg" variant="outline" className="gap-2">
                  Analyze Resume <FileUp className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="w-full px-4 md:px-6 lg:px-8 py-16 sm:py-24">
          <h2 className="text-3xl font-bold text-center mb-12">Our Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-lg border bg-card"
            >
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Normal Chat</h3>
              <p className="text-muted-foreground">
                Chat with our AI assistant about anything. Get answers, ideas,
                and creative content.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center p-6 rounded-lg border bg-card"
            >
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chat with Documents</h3>
              <p className="text-muted-foreground">
                Upload PDFs, DOCs, and other files to chat about their content
                and get insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center p-6 rounded-lg border bg-card"
            >
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Analyzer</h3>
              <p className="text-muted-foreground">
                Upload your resume to get professional analysis, feedback, and
                improvement suggestions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="w-full px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Brain className="h-5 w-5" />
              <span>SmartChat AI</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 SmartChat AI. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Developed by <span className="font-medium">Tarun Chowdala</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
