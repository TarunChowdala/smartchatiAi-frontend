import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import { useProfile } from "@/components/ProfileContext";

export default function LoginPage() {
  const { setProfile } = useProfile();
  const [userData, setUserData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  });

  const getProfileDetails = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response?.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.log(err, "err");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: userData.email,
        password: userData.password,
      });
      if (response?.data) {
        // Store the token in localStorage
        const token = response.data.idToken;
        localStorage.setItem("token", response.data.idToken);

        // Show success message
        toast.success("Login successful!", {
          duration: 2000,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        if (token) {
          getProfileDetails();
        }
      }
    } catch (error: any) {
      console.log(error, "error===");
      if (error.response?.status === 400) {
        toast.error("Invalid email or password. Please try again.", {
          duration: 2000,
        });
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.", {
          duration: 2000,
        });
      } else {
        if (error?.response && error?.response?.data.detail) {
          toast.error(
            error?.response?.data?.detail ||
              "erAn unexpected error occurred. Please try again.",
            {
              duration: 2000,
            }
          );
          return;
        }
        toast.error("erAn unexpected error occurredong. Please try again.", {
          duration: 2000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
