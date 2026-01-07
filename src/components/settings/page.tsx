import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Key,
  User,
  Shield,
  Globe,
  Eye,
  EyeOff,
  Loader2,
  BarChart3,
  Users,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useProfile } from "../ProfileContext";
import api from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import { useUpdateMe, useUpdatePassword } from "@/hooks/auth/useAuth";
import { useMyUsage, useAllUsers, useResetUserUsage, useUserUsage } from "@/hooks/usage/useUsage";
import { useSubmitQuery, useMyQueries, useAllQueries, useReplyToQuery, useUpdateQueryStatus } from "@/hooks/help/useHelp";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const { profile, fetchUserDetails } = useProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [userData, setUserData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    about: profile?.about || "",
  });

  const updateUserMutation = useUpdateMe();
  const updatePasswordMutation = useUpdatePassword();
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Usage stats hooks
  const { data: myUsageData, isLoading: usageLoading } = useMyUsage();
  const { data: allUsersData, isLoading: allUsersLoading, refetch: refetchAllUsers } = useAllUsers(100);
  const { mutate: resetUserUsage, isPending: isResetting } = useResetUserUsage();
  
  // Admin dialog states
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [userToReset, setUserToReset] = useState<string | null>(null);

  const { data: selectedUserData } = useUserUsage(selectedUser);

  // Help/Support states
  const [helpSubject, setHelpSubject] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [queryStatusFilter, setQueryStatusFilter] = useState<string>("all");

  // Help hooks
  const submitQueryMutation = useSubmitQuery();
  const { data: myQueriesData, isLoading: myQueriesLoading, refetch: refetchMyQueries } = useMyQueries();
  const { data: allQueriesData, isLoading: allQueriesLoading, refetch: refetchAllQueries } = useAllQueries(
    queryStatusFilter === "all" ? undefined : queryStatusFilter
  );
  const replyToQueryMutation = useReplyToQuery();
  const updateQueryStatusMutation = useUpdateQueryStatus();

  // Helper to calculate progress percentage
  const getProgressPercentage = (current: number, limit: number | "unlimited") => {
    if (limit === "unlimited") return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Helper to format limit display
  const formatLimit = (limit: number | "unlimited") => {
    return limit === "unlimited" ? "∞" : limit;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        updatePassword &&
        passwords.newPassword &&
        passwords.confirmPassword
      ) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          setPasswordError("Passwords do not match");
        } else {
          setPasswordError("");
        }
      } else {
        setPasswordError("");
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [passwords.newPassword, passwords.confirmPassword, updatePassword]);

  const handleUpdateProfile = async () => {
    const body: any = {
      name: userData.name,
      email: userData.email,
      about: userData.about,
    };

    if (updatePassword) {
      if (
        !passwords.currentPassword ||
        !passwords.newPassword ||
        !passwords.confirmPassword
      ) {
        toast.error("Please provide all password fields");
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }
      body.currentPassword = passwords.currentPassword;
      body.newPassword = passwords.newPassword;
    }

    try {
      setUpdatingDetails(true);
      const response = await updateUserMutation.mutateAsync(body);
      toast.success("Profile updated successfully");
      if (updatePassword) {
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setUpdatePassword(false);
      }
      setUpdatingDetails(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      setUpdatingDetails(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      toast.error("Please provide all password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setResettingPassword(true);
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      toast.success("Password updated successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setUpdatePassword(false);
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.response?.status === 401) {
        toast.error("Current password is incorrect");
      } else if (error.response?.status === 400) {
        toast.error("Failed to update password");
      } else {
        toast.error("An error occurred while updating password");
      }
      setResettingPassword(false);
    }
  };

  const handleResetUser = () => {
    if (!userToReset) return;
    
    resetUserUsage(userToReset, {
      onSuccess: () => {
        toast.success("User usage reset successfully");
        setShowResetDialog(false);
        setUserToReset(null);
        refetchAllUsers();
      },
      onError: (error) => {
        toast.error("Failed to reset user usage");
        console.error(error);
      },
    });
  };

  const handleViewUser = (userId: string) => {
    setSelectedUser(userId);
    setShowUserDialog(true);
  };

  const handleSubmitQuery = async () => {
    if (!helpSubject.trim() || !helpMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    submitQueryMutation.mutate(
      {
        subject: helpSubject,
        message: helpMessage,
      },
      {
        onSuccess: () => {
          toast.success("Query submitted successfully");
          setHelpSubject("");
          setHelpMessage("");
          refetchMyQueries();
        },
        onError: (error) => {
          toast.error("Failed to submit query");
          console.error(error);
        },
      }
    );
  };

  const handleReplyToQuery = () => {
    if (!selectedQuery || !adminReply.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    replyToQueryMutation.mutate(
      {
        query_id: selectedQuery,
        reply: adminReply,
      },
      {
        onSuccess: () => {
          toast.success("Reply sent successfully");
          setShowReplyDialog(false);
          setSelectedQuery(null);
          setAdminReply("");
          refetchAllQueries();
        },
        onError: (error) => {
          toast.error("Failed to send reply");
          console.error(error);
        },
      }
    );
  };

  const handleUpdateStatus = (queryId: string, status: string) => {
    updateQueryStatusMutation.mutate(
      { queryId, status },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
          refetchAllQueries();
        },
        onError: (error) => {
          toast.error("Failed to update status");
          console.error(error);
        },
      }
    );
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className={`grid w-full ${profile?.role === "admin" ? "grid-cols-5" : "grid-cols-3"}`}>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="usage">
              <BarChart3 className="h-4 w-4 mr-2" />
              Usage Stats
            </TabsTrigger>
            <TabsTrigger value="help">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </TabsTrigger>
            {profile?.role === "admin" && (
              <>
                <TabsTrigger value="admin">
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="help-queries">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Help Queries
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Account Information
                </CardTitle>
                <CardDescription>
                  Manage your account details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue="User Name"
                        value={userData?.name}
                        onChange={(e) => {
                          setUserData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        disabled={true}
                        id="email"
                        defaultValue="user@example.com"
                        value={userData?.email}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About</Label>
                    <Input
                      id="bio"
                      defaultValue="AI enthusiast and developer"
                      value={userData?.about}
                      onChange={(e) => {
                        setUserData((prev) => ({
                          ...prev,
                          about: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updatingDetails}
                >
                  {updatingDetails ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" /> Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) =>
                            setPasswords((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) =>
                            setPasswords((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordError && (
                        <p className="text-sm text-red-500 mt-1">
                          {passwordError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleUpdatePassword}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" /> Notification Settings
                </CardTitle>
                <CardDescription>
                  Manage how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">
                        Enable Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your activity
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Privacy Settings
                </CardTitle>
                <CardDescription>
                  Manage your privacy and data settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="save-history">Save Chat History</Label>
                      <p className="text-sm text-muted-foreground">
                        Store your chat conversations for future reference
                      </p>
                    </div>
                    <Switch
                      id="save-history"
                      checked={saveHistory}
                      onCheckedChange={setSaveHistory}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-retention">
                      Data Retention Period
                    </Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <Button variant="destructive">Delete All My Data</Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Your Usage Statistics
                </CardTitle>
                <CardDescription>
                  View your current usage and limits across all services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {usageLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : myUsageData?.usage ? (
                  <>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your usage limits reset monthly. Keep track of your remaining quota to ensure uninterrupted service.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {myUsageData.usage.sessions.current} / {formatLimit(myUsageData.usage.sessions.limit)}
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${getProgressPercentage(myUsageData.usage.sessions.current, myUsageData.usage.sessions.limit)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {myUsageData.usage.sessions.limit === "unlimited" 
                              ? "Unlimited usage" 
                              : `${myUsageData.usage.sessions.limit - myUsageData.usage.sessions.current} remaining`}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Document Processing</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {myUsageData.usage.documents.current} / {formatLimit(myUsageData.usage.documents.limit)}
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${getProgressPercentage(myUsageData.usage.documents.current, myUsageData.usage.documents.limit)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {myUsageData.usage.documents.limit === "unlimited" 
                              ? "Unlimited usage" 
                              : `${myUsageData.usage.documents.limit - myUsageData.usage.documents.current} remaining`}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Resume Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {myUsageData.usage.resumes.current} / {formatLimit(myUsageData.usage.resumes.limit)}
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${getProgressPercentage(myUsageData.usage.resumes.current, myUsageData.usage.resumes.limit)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {myUsageData.usage.resumes.limit === "unlimited" 
                              ? "Unlimited usage" 
                              : `${myUsageData.usage.resumes.limit - myUsageData.usage.resumes.current} remaining`}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Message Limit per Session</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatLimit(myUsageData.usage.messages_per_session_limit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {myUsageData.usage.messages_per_session_limit === "unlimited" 
                            ? "No limit on messages per session" 
                            : "Maximum messages allowed per chat session"}
                        </p>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No usage data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submit Query Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" /> Submit a Query
                  </CardTitle>
                  <CardDescription>
                    Have a question or need help? Submit your query and our team will respond.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={helpSubject}
                      onChange={(e) => setHelpSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      value={helpMessage}
                      onChange={(e) => setHelpMessage(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSubmitQuery}
                    disabled={submitQueryMutation.isPending}
                    className="w-full"
                  >
                    {submitQueryMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Query
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* My Queries Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> My Queries
                  </CardTitle>
                  <CardDescription>
                    View your submitted queries and responses from our team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myQueriesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : myQueriesData && myQueriesData.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {myQueriesData.map((query) => (
                        <Card key={query.id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">
                                  {query.subject}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {new Date(query.created_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Badge 
                                variant={
                                  query.status === "resolved" ? "default" :
                                  query.status === "in_progress" ? "secondary" :
                                  "outline"
                                }
                              >
                                {query.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="text-sm space-y-3">
                            <div>
                              <p className="text-muted-foreground">{query.message}</p>
                            </div>
                            {query.reply && (
                              <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs font-semibold mb-1">Admin Reply:</p>
                                <p className="text-sm">{query.reply}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No queries submitted yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {profile?.role === "admin" && (
            <>
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> User Management
                  </CardTitle>
                  <CardDescription>
                    View and manage all users and their usage statistics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allUsersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : allUsersData && allUsersData.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-muted-foreground">
                          Total users: {allUsersData.length}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchAllUsers()}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        {/* Fixed Header */}
                        <div className="bg-muted/80 border-b-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-semibold text-foreground py-2 px-4" style={{width: "15%"}}>Name</TableHead>
                                <TableHead className="font-semibold text-foreground py-2 px-4" style={{width: "20%"}}>Email</TableHead>
                                <TableHead className="text-center font-semibold text-foreground py-2 px-4" style={{width: "10%"}}>Role</TableHead>
                                <TableHead className="text-center font-semibold text-foreground py-2 px-4" style={{width: "12%"}}>Sessions</TableHead>
                                <TableHead className="text-center font-semibold text-foreground py-2 px-4" style={{width: "13%"}}>Documents</TableHead>
                                <TableHead className="text-center font-semibold text-foreground py-2 px-4" style={{width: "12%"}}>Resumes</TableHead>
                                <TableHead className="text-right font-semibold text-foreground py-2 px-4" style={{width: "18%"}}>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                          </Table>
                        </div>
                        
                        {/* Scrollable Body */}
                        <div className="overflow-y-auto custom-scrollbar" style={{height: "calc(100vh - 450px)"}}>
                          <Table>
                            <TableBody>
                              {allUsersData.map((user) => {
                                const isSessionOverLimit = user.usage.sessions.limit !== "unlimited" && 
                                  user.usage.sessions.current >= user.usage.sessions.limit;
                                const isDocumentOverLimit = user.usage.documents.limit !== "unlimited" && 
                                  user.usage.documents.current >= user.usage.documents.limit;
                                const isResumeOverLimit = user.usage.resumes.limit !== "unlimited" && 
                                  user.usage.resumes.current >= user.usage.resumes.limit;

                                return (
                                  <TableRow key={user.user_id}>
                                    <TableCell className="font-medium py-2 px-4" style={{width: "15%"}}>
                                      {user.name || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground py-2 px-4" style={{width: "20%"}}>
                                      {user.email || user.user_id}
                                    </TableCell>
                                    <TableCell className="text-center py-2 px-4" style={{width: "10%"}}>
                                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                        {user.role}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-2 px-4" style={{width: "12%"}}>
                                      <Badge variant={isSessionOverLimit ? "destructive" : "secondary"}>
                                        {user.usage.sessions.current}/{formatLimit(user.usage.sessions.limit)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-2 px-4" style={{width: "13%"}}>
                                      <Badge variant={isDocumentOverLimit ? "destructive" : "secondary"}>
                                        {user.usage.documents.current}/{formatLimit(user.usage.documents.limit)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-2 px-4" style={{width: "12%"}}>
                                      <Badge variant={isResumeOverLimit ? "destructive" : "secondary"}>
                                        {user.usage.resumes.current}/{formatLimit(user.usage.resumes.limit)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 py-2 px-4" style={{width: "18%"}}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewUser(user.user_id)}
                                      >
                                        View
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setUserToReset(user.user_id);
                                          setShowResetDialog(true);
                                        }}
                                        disabled={isResetting}
                                      >
                                        Reset
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="help-queries">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> User Queries
                  </CardTitle>
                  <CardDescription>
                    Review and respond to user help queries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Label>Filter by Status:</Label>
                    <Select value={queryStatusFilter} onValueChange={setQueryStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchAllQueries()}
                      className="ml-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {allQueriesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : allQueriesData && allQueriesData.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {allQueriesData.map((query) => (
                        <Card key={query.id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-sm font-medium">
                                    {query.subject}
                                  </CardTitle>
                                  <Badge 
                                    variant={
                                      query.status === "resolved" ? "default" :
                                      query.status === "in_progress" ? "secondary" :
                                      query.status === "closed" ? "outline" :
                                      "destructive"
                                    }
                                  >
                                    {query.status === "in_progress" ? "In Progress" : query.status}
                                  </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                  User ID: {query.user_id}
                                </CardDescription>
                                <CardDescription className="text-xs">
                                  {new Date(query.created_at).toLocaleString()}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-sm">{query.message}</p>
                            </div>
                            
                            {query.reply ? (
                              <div className="bg-primary/10 p-3 rounded-md">
                                <p className="text-xs font-semibold mb-1">Your Reply:</p>
                                <p className="text-sm">{query.reply}</p>
                              </div>
                            ) : (
                              <Alert>
                                <Clock className="h-4 w-4" />
                                <AlertDescription>
                                  No reply sent yet
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedQuery(query.id);
                                  setAdminReply(query.reply || "");
                                  setShowReplyDialog(true);
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {query.reply ? "Edit Reply" : "Reply"}
                              </Button>
                              
                              {query.status !== "resolved" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(query.id, "resolved")}
                                  disabled={updateQueryStatusMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Resolved
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No queries found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </>
          )}
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed usage statistics for the selected user.
              </DialogDescription>
            </DialogHeader>
            {selectedUserData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedUserData.name || "N/A"}</p>
                  </div>
                  {selectedUserData.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p>{selectedUserData.email}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <Badge variant={selectedUserData.role === "admin" ? "default" : "outline"}>
                      {selectedUserData.role}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-mono text-xs">{selectedUserData.user_id}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Session Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedUserData.usage.sessions.current} / {formatLimit(selectedUserData.usage.sessions.limit)}
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${getProgressPercentage(selectedUserData.usage.sessions.current, selectedUserData.usage.sessions.limit)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedUserData.usage.sessions.limit === "unlimited" 
                          ? "Unlimited usage" 
                          : `${selectedUserData.usage.sessions.limit - selectedUserData.usage.sessions.current} remaining`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Document Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedUserData.usage.documents.current} / {formatLimit(selectedUserData.usage.documents.limit)}
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${getProgressPercentage(selectedUserData.usage.documents.current, selectedUserData.usage.documents.limit)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedUserData.usage.documents.limit === "unlimited" 
                          ? "Unlimited usage" 
                          : `${selectedUserData.usage.documents.limit - selectedUserData.usage.documents.current} remaining`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Resume Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedUserData.usage.resumes.current} / {formatLimit(selectedUserData.usage.resumes.limit)}
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${getProgressPercentage(selectedUserData.usage.resumes.current, selectedUserData.usage.resumes.limit)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedUserData.usage.resumes.limit === "unlimited" 
                          ? "Unlimited usage" 
                          : `${selectedUserData.usage.resumes.limit - selectedUserData.usage.resumes.current} remaining`}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Message Limit per Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatLimit(selectedUserData.usage.messages_per_session_limit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedUserData.usage.messages_per_session_limit === "unlimited" 
                        ? "No limit on messages per session" 
                        : "Maximum messages allowed per chat session"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset User Usage</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset this user's usage counts? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setUserToReset(null);
                }}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetUser}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Usage"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reply to Query Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Query</DialogTitle>
              <DialogDescription>
                Send a response to the user's help query.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminReply">Your Reply</Label>
                <Textarea
                  id="adminReply"
                  placeholder="Type your response here..."
                  rows={8}
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyDialog(false);
                  setSelectedQuery(null);
                  setAdminReply("");
                }}
                disabled={replyToQueryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReplyToQuery}
                disabled={replyToQueryMutation.isPending}
              >
                {replyToQueryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
      <Toaster position="top-right" />
    </div>
  );
}
