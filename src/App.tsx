import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardLayout from "./components/layouts/DashboardLayout";
import { ThemeProvider } from "./components/theme-provider";
import ChatPage from "./components/chat/page";
import DocumentChatPage from "./components/document/page";
import ResumePage from "./components/resume/page";
import SettingsPage from "./components/settings/page";
import { LogIn } from "lucide-react";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProtectedRoute from "./pages/ProtectedRoute";
import { ProfileProvider } from "./components/ProfileContext";
import { CurrentSessionProvider } from "./components/CurrentSession";
import NotFound from "./pages/Notfound";

function App() {
  return (
    <ProfileProvider>
      <CurrentSessionProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    component={
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    }
                  />
                }
              />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute
                    component={
                      <DashboardLayout>
                        <Routes>
                          <Route path="chat" element={<ChatPage />} />
                          <Route
                            path="document"
                            element={<DocumentChatPage />}
                          />
                          <Route path="resume" element={<ResumePage />} />
                          <Route path="settings" element={<SettingsPage />} />
                        </Routes>
                      </DashboardLayout>
                    }
                  />
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </CurrentSessionProvider>
    </ProfileProvider>
  );
}

export default App;
