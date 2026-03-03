import { useEffect, useState } from "react";
import { account } from "../appwrite/config";
import { AuthContext } from "./contexts";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setError(null);
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (err) {
        // User is not logged in or session expired
        setUser(null);
        // Only log non-401 errors (401 is expected for unauthenticated users)
        if (err.code !== 401) {
          console.error("Auth load error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Safe logout function
  const logout = async () => {
    try {
      setError(null);
      await account.deleteSession("current");
    } catch (err) {
      // No active session or session already expired
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
    } finally {
      setUser(null);
    }
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get display name
  const getDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || "User";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        error,
        isAuthenticated,
        getUserInitials,
        getDisplayName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};