import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import api from "@/lib/api";

interface Profile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  about?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  isLoading: boolean;
  fetchUserDetails: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/auth/me");

      if (response.data) {
        let data = response.data;
        data.id = data.uid;
        delete data.uid;
        setProfile(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setProfile(null);
  };

  useEffect(() => {
    token && fetchUserDetails();
  }, [token]);

  const value = {
    profile,
    setProfile,
    isAuthenticated: !!profile,
    logout,
    isLoading,
    fetchUserDetails,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
