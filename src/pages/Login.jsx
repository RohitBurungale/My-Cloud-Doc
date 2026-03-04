import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import Navbar from "../components/Navbar";
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Shield,
  Cloud,
  CheckCircle,
  ArrowRight,
  Users,
  Star,
  HardDrive,
  Zap,
  Globe
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading || submitting || user) return;

    setError("");
    setSubmitting(true);

    try {
      // Clear any existing sessions first
      try {
        await account.deleteSession('current');
      } catch (err) {
        // No existing session, continue
      }

      // Create new session
      const session = await account.createEmailPasswordSession(email, password);
      console.log("Session created:", session);

      // Get current user
      const currentUser = await account.get();
      console.log("User fetched:", currentUser);
      
      setUser(currentUser);

      // Small delay to ensure state updates
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
      
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === 401) {
        setError("Invalid email or password");
      } else if (err.code === 429) {
        setError("Too many attempts. Please try again later");
      } else {
        setError(err.message || "Login failed. Please try again");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <Cloud className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading your secure workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 
        flex items-center justify-center px-4 py-8">
        
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Panel - Branding & Info (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Header Gradient */}
              <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                {/* Logo & Title */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-lg" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl 
                      flex items-center justify-center shadow-lg">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">CloudDoc</h1>
                    <p className="text-sm text-gray-500">Secure Document Storage</p>
                  </div>
                </div>

                {/* Welcome Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Sign in to access your secure workspace and manage your documents with enterprise-grade encryption.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Shield, text: "256-bit AES", color: "indigo", subtext: "Encryption" },
                    { icon: Lock, text: "Zero-Knowledge", color: "purple", subtext: "Privacy" },
                    { icon: HardDrive, text: "Free Storage", color: "indigo", subtext: "Storage" },
                    { icon: Zap, text: "Real-time", color: "purple", subtext: "Sync" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`p-2 rounded-lg bg-${feature.color}-100`}>
                        <feature.icon className={`w-4 h-4 text-${feature.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{feature.text}</h3>
                        <p className="text-xs text-gray-500">{feature.subtext}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust Badge */}
                <div className="mt-auto p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 
                          border-2 border-white flex items-center justify-center text-white font-semibold text-xs">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-indigo-900 font-medium text-center mt-2">
                    Trusted by 10,000+ users worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
                  <Cloud className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-900">CloudDoc</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-sm">Sign in to continue to your account</p>
              </div>

              {/* Desktop Form Header */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600
                          disabled:bg-gray-100 disabled:cursor-not-allowed
                          transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600
                          disabled:bg-gray-100 disabled:cursor-not-allowed
                          transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 
                          text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded 
                        focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      Keep me signed in
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600
                    hover:from-indigo-700 hover:to-purple-700
                    text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-indigo-600 hover:text-indigo-700 font-semibold
                      hover:underline inline-flex items-center gap-1 group"
                  >
                    Create account
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>AES-256 Encrypted</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Zero-Knowledge</span>
                </div>
              </div>

              {/* Mobile Features */}
              <div className="lg:hidden mt-6 grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">10k+ Users</span>
                </div>
                <div className="text-center">
                  <HardDrive className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs text-gray-500"> Free Storage</span>
                </div>
                <div className="text-center">
                  <Globe className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;