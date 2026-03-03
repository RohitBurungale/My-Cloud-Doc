import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../appwrite/config";
import Navbar from "../components/Navbar";
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Zap, 
  Smartphone, 
  Cloud,
  Lock,
  Mail,
  User,
  Key,
  AlertCircle
} from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await account.create("unique()", email, password, name);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);

      if (err.code === 409) {
        setError("Account already exists. Please login.");
      } else {
        setError(err.message || "Registration failed");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0b1d33] via-[#0f2a44] to-[#08162a]
        flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4 text-slate-100 relative overflow-hidden">

        {/* Decorative Background Elements - Responsive sizing */}
        <div className="fixed top-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 
          bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-40 sm:w-56 md:w-80 h-40 sm:h-56 md:h-80 
          bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Success Popup - Responsive */}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 
            px-3 sm:px-4 animate-fade-in">
            <div className="bg-gradient-to-br from-[#0f213a] to-[#0a1828] rounded-2xl sm:rounded-3xl 
              p-5 sm:p-6 md:p-8 w-full max-w-[280px] sm:max-w-sm text-center 
              shadow-2xl shadow-cyan-500/20 
              border border-cyan-500/30
              animate-scale-in">
              
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-75" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
                  bg-gradient-to-br from-green-400 to-emerald-500 
                  rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl
                  shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                Account Created!
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-3 sm:mb-4">
                Your account was created successfully.
              </p>

              <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full
                  animate-[width-expand_2s_ease-out_forwards]"
                  style={{animation: 'width-expand 2s ease-out forwards', width: '0%'}} />
              </div>

              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 mt-3 sm:mt-4 
                flex items-center justify-center gap-1.5 sm:gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        {/* Main Container - Responsive */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-5xl 
          grid md:grid-cols-2 rounded-xl sm:rounded-2xl md:rounded-3xl 
          overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-xl 
          relative z-10 border border-cyan-500/10 animate-scale-in my-auto
          mx-auto md:mx-0">

          {/* Left panel - Hidden on Mobile */}
          <div className="hidden md:flex flex-col justify-between p-8 lg:p-10
            bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-900 relative overflow-hidden">

            <div className="absolute -top-10 -left-10 w-32 lg:w-40 h-32 lg:h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-48 lg:w-56 h-48 lg:h-56 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm 
                font-semibold bg-white/30 rounded-full shadow-lg backdrop-blur-sm">
                Get Started
              </span>

              <h2 className="mt-4 lg:mt-6 text-2xl lg:text-4xl font-extrabold leading-tight">
                Create Your <br /> Cloud Account
              </h2>

              <p className="mt-3 lg:mt-4 text-sm lg:text-base opacity-90 leading-relaxed">
                Secure document storage built with React & Appwrite.
              </p>

              <div className="mt-6 lg:mt-8 space-y-2 lg:space-y-3">
                {[
                  "🚀 5GB free storage",
                  "🔐 Military-grade encryption",
                  "⚡ Instant file sync",
                  "📱 Multi-device access"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs lg:text-sm font-medium">
                    <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-slate-900" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex justify-center mt-6 lg:mt-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative h-24 w-24 lg:h-32 lg:w-32 rounded-full bg-white/30 backdrop-blur-sm
                  flex items-center justify-center text-3xl lg:text-5xl
                  shadow-xl hover:scale-110 transition-transform duration-300">
                  ☁️
                </div>
              </div>
            </div>
          </div>

          {/* Right form - Mobile Optimized */}
          <div className="bg-gradient-to-br from-[#0f213a] to-[#0a1828] 
            p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center relative">
            
            {/* Mobile Header */}
            <div className="md:hidden text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold
                bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/20">
                <Cloud className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Secure Cloud Doc</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 
              bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm text-center mb-4 sm:mb-5">
              Sign up to get started with 5GB free storage
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/30 
                backdrop-blur-sm animate-fade-in-up">
                <p className="text-red-400 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 
                    w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm
                      bg-[#08162a]/50 border border-slate-700/50 rounded-xl
                      focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                      placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm
                      transition-all duration-200 backdrop-blur-sm text-white"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 
                    w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm
                      bg-[#08162a]/50 border border-slate-700/50 rounded-xl
                      focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                      placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm
                      transition-all duration-200 backdrop-blur-sm text-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 
                    w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm
                      bg-[#08162a]/50 border border-slate-700/50 rounded-xl
                      focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                      placeholder:text-slate-600 placeholder:text-xs sm:placeholder:text-sm
                      transition-all duration-200 backdrop-blur-sm text-white"
                  />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                  <span className="text-cyan-400">💡</span>
                  <span>Use 8+ characters with letters, numbers & symbols</span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={success}
                className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                  bg-gradient-to-r from-cyan-500 to-teal-500
                  text-slate-900 
                  hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300
                  relative overflow-hidden group
                  min-h-[44px] sm:min-h-[48px]">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {success ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Terms Agreement - Mobile optimized */}
            <p className="text-[10px] sm:text-xs text-slate-500 text-center mt-3 sm:mt-4 leading-relaxed">
              By creating an account, you agree to our{" "}
              <button className="text-cyan-400 hover:underline font-medium">
                Terms
              </button>
              {" "}and{" "}
              <button className="text-cyan-400 hover:underline font-medium">
                Privacy Policy
              </button>
            </p>

            {/* Divider */}
            <div className="relative my-3 sm:my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs">
                <span className="px-2 sm:px-3 bg-[#0f213a] text-slate-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-xs sm:text-sm text-center text-slate-400">
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold
                  hover:underline transition-colors inline-flex items-center gap-1
                  py-1 sm:py-0"
              >
                Sign in instead
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </p>

            {/* Security Badge - Responsive */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/30 
              flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                <span>256-bit encryption</span>
              </div>
              <span className="hidden xs:inline">•</span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">End-to-end secure</span>
                <span className="xs:hidden">Secure</span>
              </div>
            </div>

            {/* Mobile Features Strip */}
            <div className="md:hidden mt-4 grid grid-cols-4 gap-1 pt-4 border-t border-slate-700/30">
              <div className="text-center">
                <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[8px] text-slate-500">Fast</span>
              </div>
              <div className="text-center">
                <Shield className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[8px] text-slate-500">Secure</span>
              </div>
              <div className="text-center">
                <Cloud className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[8px] text-slate-500">Cloud</span>
              </div>
              <div className="text-center">
                <Smartphone className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[8px] text-slate-500">Mobile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes width-expand {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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
          
          .xs\\:hidden {
            display: none;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, a, input {
            min-height: 44px;
          }
          
          input {
            font-size: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Register;