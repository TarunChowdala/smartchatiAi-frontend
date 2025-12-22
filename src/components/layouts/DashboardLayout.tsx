import { useState } from "react";
import "./styles.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  FileText,
  FileUp,
  Home,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useProfile } from "../ProfileContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  console.log(profile, "profile");

  const navigation = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Chat", path: "/dashboard/chat", icon: Brain },
    { name: "Document Chat", path: "/dashboard/document", icon: FileText },
    { name: "Resume Analyzer", path: "/dashboard/resume", icon: FileUp },
    // { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen bg-background dashboard-layout-container">
        {/* Sidebar for desktop */}
        <Sidebar>
          <SidebarHeader className="flex items-center px-4 py-2">
            <Link to="/" className="flex items-center gap-2 font-bold">
              <Brain className="h-6 w-6" />
              <span>SmartChat AI</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.name}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={
                    profile?.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile?.name ?? ""
                    )}&background=random&color=fff`
                  }
                />
                <AvatarFallback>
                  {(profile?.name && profile.name[0].toUpperCase()) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{profile?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {profile?.email}
                </span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile menu */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2 font-bold">
              <Brain className="h-6 w-6" />
              <span>SmartChat AI</span>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 z-40 bg-background pt-16"
            >
              <div className="flex flex-col p-4 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-muted border border-primary text-foreground"
                        : "hover:bg-muted hover:text-accent-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-accent"
                  onClick={() => {
                    navigate("/dashboard/settings");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {!isMobile && (
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 w-full">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                <ModeToggle />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full bg-accent/50 hover:bg-accent"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={
                            profile?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              profile?.name ?? ""
                            )}&background=random&color=fff`
                          }
                        />
                        <AvatarFallback>
                          {" "}
                          {(profile?.name && profile.name[0].toUpperCase()) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 border bg-card p-2 rounded-lg"
                    align="end"
                  >
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {profile?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        className="justify-start hover:bg-accent"
                        onClick={() => {
                          navigate("/dashboard/settings");
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start hover:bg-accent"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </header>
          )}
          <main
            className="flex-1 w-full overflow-auto flex justify-center"
            style={{
              maxHeight: "calc(100vh - 65px)",
              scrollbarWidth: "none",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
