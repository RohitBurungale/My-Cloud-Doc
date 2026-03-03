import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import Navbar from "../components/Navbar";
import { ArrowRight, Lock, Cloud, Shield, Zap, Smartphone } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      } catch {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1d33] via-[#0f2a44] to-[#08162a]">
        <div className="text-center space-y-4 animate-fade-in px-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs sm:text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0b1d33] via-[#0f2a44] to-[#08162a]
        flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4 text-slate-100 relative overflow-hidden">

        {/* Decorative Background Elements - Adjusted for mobile */}
        <div className="fixed top-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Main Container - Responsive sizing */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-5xl 
          grid md:grid-cols-2 rounded-xl sm:rounded-2xl md:rounded-3xl 
          overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-xl 
          relative z-10 border border-cyan-500/10 animate-scale-in my-auto
          mx-auto md:mx-0">
          
          {/* Left Panel - Enhanced for Desktop, Hidden on Mobile */}
          <div className="hidden md:flex flex-col justify-between p-8 lg:p-10
            bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-900 relative overflow-hidden">
            
            <div className="absolute -top-10 -right-10 w-32 lg:w-40 h-32 lg:h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-48 lg:w-56 h-48 lg:h-56 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-semibold 
                bg-white/30 rounded-full shadow-lg backdrop-blur-sm">
                Welcome Back
              </span>
              <h2 className="mt-4 lg:mt-6 text-2xl lg:text-4xl font-extrabold leading-tight">
                Access Your <br /> Cloud Documents
              </h2>
              <p className="mt-3 lg:mt-4 text-sm lg:text-base opacity-90 leading-relaxed">
                Securely manage your documents in your private cloud workspace.
              </p>

              <div className="mt-6 lg:mt-8 space-y-2 lg:space-y-3">
                {[
                  "🔐 End-to-end encryption",
                  "⚡ Instant sync across devices",
                  "📱 Access from anywhere"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs lg:text-sm font-medium">
                    <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-slate-900" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex justify-center mt-6 lg:mt-8">
              <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-full bg-white/30 backdrop-blur-sm
                flex items-center justify-center text-3xl lg:text-5xl
                shadow-xl hover:scale-110 transition-transform duration-300">
                ☁️
              </div>
            </div>
          </div>

          {/* Right Form - Mobile Optimized */}
          <div className="bg-gradient-to-br from-[#0f213a] to-[#0a1828] 
            p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center relative">
            
            {/* Mobile Header - Visible only on mobile */}
            <div className="md:hidden text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold
                bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/20">
                <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Secure Cloud Doc</span>
              </div>
            </div>

            {/* Title - Responsive sizing */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 
              bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm text-center mb-4 sm:mb-5">
              Sign in to access your documents
            </p>

            {/* Error Message - Mobile optimized */}
            {error && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/30 
                backdrop-blur-sm animate-fade-in-up">
                <p className="text-red-400 text-xs sm:text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Form - Mobile friendly inputs */}
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm
                    bg-[#08162a]/50 border border-slate-700/50
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                    disabled:opacity-60 disabled:cursor-not-allowed
                    placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm
                    transition-all duration-200
                    backdrop-blur-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  autoComplete="current-password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm
                    bg-[#08162a]/50 border border-slate-700/50
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                    disabled:opacity-60 disabled:cursor-not-allowed
                    placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm
                    transition-all duration-200
                    backdrop-blur-sm text-white"
                />
              </div>

              {/* Submit Button - Touch friendly */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                  bg-gradient-to-r from-cyan-500 to-teal-500
                  text-slate-900 
                  hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300
                  relative overflow-hidden group
                  touch-manipulation min-h-[44px] sm:min-h-[48px]">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider - Mobile optimized */}
            <div className="relative my-4 sm:my-5 md:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs">
                <span className="px-2 sm:px-3 bg-[#0f213a] text-slate-500">New to Cloud Doc?</span>
              </div>
            </div>

            {/* Register Link - Touch friendly */}
            <p className="text-xs sm:text-sm text-center text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold
                hover:underline transition-colors inline-block py-1 sm:py-0">
                Create account
              </Link>
            </p>

            {/* Security Badge - Mobile responsive */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/30 
              flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>256-bit encryption</span>
              <span className="hidden xs:inline">•</span>
              <span className="hidden xs:inline">End-to-end secure</span>
            </div>

            {/* Mobile Features - Visible only on mobile */}
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700/30">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[8px] text-slate-500">Encrypted</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[8px] text-slate-500">Fast</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[8px] text-slate-500">Mobile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        /* Extra small devices (320px and up) */
        @media (min-width: 320px) {
          .xs\\:inline {
            display: inline;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, a, input {
            min-height: 44px;
          }
          
          input {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </>
  );
};

export default Login;