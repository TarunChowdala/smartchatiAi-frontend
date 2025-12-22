import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "@/hooks/auth/useAuth";

interface Profile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  about?: string;
  password: string;
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
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");
  const { data: userData, isLoading, refetch: fetchUserDetails } = useGetMe();

  // Transform user data to match Profile interface
  const profile = userData
    ? {
        ...userData,
        id: userData.id || userData.uid,
        profileImage: userData.profileImage || "",
      }
    : null;

  const setProfile = (newProfile: Profile | null) => {
    if (newProfile) {
      queryClient.setQueryData(["auth", "me"], newProfile);
    } else {
      queryClient.setQueryData(["auth", "me"], null);
    }
  };

  const logout = () => {
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
  };

  const value = {
    profile,
    setProfile,
    isAuthenticated: !!profile,
    logout,
    isLoading,
    fetchUserDetails: async () => {
      await fetchUserDetails();
    },
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
