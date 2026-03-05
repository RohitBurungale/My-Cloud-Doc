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
  Globe,
  Fingerprint,
  Sparkles
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cloud className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Preparing your secure workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
        flex items-center justify-center px-4 py-8 relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="w-full max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Panel - Premium Branding Card */}
            <div className="hidden lg:flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
              
              {/* Animated Gradient Header */}
              <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                
                {/* Floating Orbs */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/20 rounded-full blur-3xl animate-pulse delay-700" />
                
                {/* 3D Card Effect */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Logo */}
                <div className="absolute bottom-6 left-8 flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl" />
                    <div className="relative w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 
                      flex items-center justify-center shadow-2xl">
                      <Cloud className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">CloudDoc</h1>
                    <p className="text-white/80 text-sm">Secure Document Storage</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                {/* Welcome Message with Gradient */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Welcome Back!</span>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    Access Your
                    <span className="block mt-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Secure Workspace
                    </span>
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Sign in to manage your documents with enterprise-grade encryption and real-time sync across all devices.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Shield, title: "256-bit AES", desc: "Military-grade", color: "blue" },
                    { icon: Fingerprint, title: "Zero-Knowledge", desc: "Privacy first", color: "indigo" },
                    { icon: HardDrive, title: "5GB Free", desc: "Secure storage", color: "purple" },
                    { icon: Zap, title: "Real-time", desc: "Instant sync", color: "blue" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white 
                      rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group">
                      <div className={`p-3 rounded-xl bg-${feature.color}-50 group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-xs text-gray-500">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                            border-2 border-white flex items-center justify-center text-white font-bold text-xs
                            shadow-lg transform hover:scale-110 transition-transform">
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">10,000+ Users</p>
                        <p className="text-xs text-gray-500">Join the community</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 
              transform hover:shadow-indigo-200/50 transition-all duration-500">
              
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                  text-white rounded-full mb-4 shadow-lg">
                  <Cloud className="w-4 h-4" />
                  <span className="text-sm font-semibold">CloudDoc</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-sm">Sign in to continue to your account</p>
              </div>

              {/* Desktop Form Header */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                  Sign In
                </h2>
                <p className="text-gray-600 text-sm ml-3">Enter your credentials to access your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 
                      rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 
                        group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl
                          focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                          disabled:bg-gray-50 disabled:cursor-not-allowed
                          placeholder:text-gray-400 text-gray-900
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
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium 
                        hover:underline flex items-center gap-1"
                    >
                      Forgot?
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 
                      rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5
                        group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={submitting}
                        className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl
                          focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200
                          disabled:bg-gray-50 disabled:cursor-not-allowed
                          placeholder:text-gray-400 text-gray-900
                          transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 
                          text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                        focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      Keep me signed in
                    </span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">2FA</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                    hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700
                    text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                    relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full 
                    group-hover:translate-x-full transition-transform duration-700" />
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <LogIn className="w-5 h-5" />
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-blue-600 hover:text-blue-700 font-semibold
                      hover:underline inline-flex items-center gap-1 group"
                  >
                    Create account
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-blue-700 font-medium">AES-256</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-indigo-700 font-medium">Zero-Knowledge</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-purple-700 font-medium">GDPR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </>
  );
};

export default Login;