import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useProfile } from "@/components/ProfileContext";
import { useSignup, useGoogleSignup } from "@/hooks/auth/useAuth";
import { useQueryClient } from "@tanstack/react-query";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  const signupMutation = useSignup();
  const googleSignupMutation = useGoogleSignup();
  const queryClient = useQueryClient();
  const isLoading = signupMutation.isPending || googleSignupMutation.isPending;

  const debouncedConfirmPassword = useDebounce(confirmPassword, 500);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
    if (debouncedConfirmPassword && password !== debouncedConfirmPassword) {
      setPasswordError("Passwords do not match!");
    } else {
      setPasswordError("");
    }
  }, [password, debouncedConfirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid;
      console.log("Firebase account created successfully, UID:", uid);

      // calling signup api to store user in users table
      try {
        await signupMutation.mutateAsync({
          email,
          password,
          name,
          uid: uid,
          idToken: idToken,
          about: "",
        });

        toast.success("Account created successfully!", {
          duration: 2000,
          position: "top-right",
        });
        navigate("/login");
      } catch (backendError: any) {
        console.error("Backend signup failed:", backendError);

        //delete the Firebase account if backend fails
        await userCredential.user.delete();

        toast.error("Account creation failed. Please try again.", {
          duration: 2000,
        });
      }
    } catch (error: any) {
      console.log(error, "error");

      // Handling Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email is already registered. Please try logging in.", {
          duration: 2000,
        });
      } else if (error.code === "auth/weak-password") {
        toast.error(
          "Password is too weak. Please choose a stronger password.",
          {
            duration: 2000,
          }
        );
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email format. Please check your email.", {
          duration: 2000,
        });
      } else if (error.response?.status === 400) {
        toast.error("Please check your email and password format.", {
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
              "An unexpected error occurred. Please try again.",
            {
              duration: 2000,
            }
          );
          return;
        }
        toast.error("An unexpected error occurred. Please try again.", {
          duration: 2000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const uid = user.uid;
      const name = user.displayName;
      const email = user.email;
      const profileImage = user.photoURL;
      const isNewUser = (result as any)?._tokenResponse?.isNewUser ?? false;
      const refreshToken = (result as any)?._tokenResponse?.refreshToken;
      if (isNewUser) {
        try {
          await api.post("/auth/google-signup", {
            email,
            name,
            uid,
            idToken,
            profileImage,
          });
          toast.success("Successfully signed up with Google.", {
            duration: 2000,
          });
          localStorage.setItem("token", idToken);
          localStorage.setItem("refreshToken", refreshToken);
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        } catch {
          await user.delete();
          toast.error("Account creation failed. Please try again.", {
            duration: 2000,
          });
          return;
        }
      } else {
        toast.success("Successfully signed in with Google.", {
          duration: 2000,
        });
        localStorage.setItem("token", idToken);
        localStorage.setItem("refreshToken", refreshToken);
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      toast.error("Google sign-in failed. Please try again.", {
        duration: 2000,
      });
      console.error(error);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-center">
            Create an account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Sign up with Google
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
        <Toaster position="top-right" />
      </Card>
    </div>
  );
}
