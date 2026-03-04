import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // ✅ Fixed import path

// Custom hook with error handling
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Higher-order component for protecting routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      // Use React Router for navigation instead of direct window.location
      // This is just a fallback - better to use useNavigate in the component
      window.location.href = '/login';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};