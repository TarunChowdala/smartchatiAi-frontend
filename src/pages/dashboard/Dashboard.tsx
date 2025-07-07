import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, FileText, FileUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8" style={{ overflow: "hidden" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome to your AI Assistant dashboard. Choose a tool to get started.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">AI Chat</CardTitle>
              <Brain className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Chat with our AI assistant about anything. Get answers, ideas,
                and creative content.
              </CardDescription>
              <Link to="/dashboard/chat">
                <Button className="w-full gap-2">
                  Start Chatting <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Document Chat</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Upload PDFs, DOCs, and other files to chat about their content
                and get insights.
              </CardDescription>
              <Link to="/dashboard/document">
                <Button className="w-full gap-2">
                  Upload Document <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Resume Analyzer</CardTitle>
              <FileUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Upload your resume to get professional analysis, feedback, and
                improvement suggestions.
              </CardDescription>
              <Link to="/dashboard/resume">
                <Button className="w-full gap-2">
                  Analyze Resume <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
