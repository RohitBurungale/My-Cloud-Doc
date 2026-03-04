import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../appwrite/config";
import Navbar from "../components/Navbar";
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
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

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 
        flex items-center justify-center px-4 py-8">
        
        {/* Success Popup */}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created!
              </h3>
              <p className="text-gray-600 mb-4">
                Your account was created successfully.
              </p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full
                  animate-progress" />
              </div>
              <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Panel - Branding & Info */}
            <div className="hidden lg:block">
              <div className="max-w-md mx-auto">
                {/* Logo & Title */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 
                    rounded-xl flex items-center justify-center shadow-lg">
                    <Cloud className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">CloudDoc</h1>
                    <p className="text-sm text-gray-600">Secure Document Storage</p>
                  </div>
                </div>

                {/* Welcome Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Join CloudDoc Today
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create your free account and get 5GB of secure cloud storage with enterprise-grade encryption.
                </p>

                {/* Feature List */}
                <div className="space-y-4">
                  {[
                    { icon: Shield, title: "Bank-Level Security", desc: "256-bit AES encryption protects your data" },
                    { icon: Cloud, title: "5GB Free Storage", desc: "Store and sync files across all devices" },
                    { icon: Lock, title: "Privacy First", desc: "Zero-knowledge architecture ensures privacy" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust Badge */}
                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-sm text-indigo-900 font-medium text-center">
                    🔒 Join 10,000+ users who trust CloudDoc
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
                    <Cloud className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-900">CloudDoc</span>
                  </div>
                </div>

                {/* Form Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Sign up to get started with 5GB free storage
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                      <span className="text-indigo-600">💡</span>
                      <span>Use 8+ characters with letters, numbers & symbols</span>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={success}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600
                      hover:from-indigo-700 hover:to-purple-700
                      text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {success ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>

                {/* Terms Agreement */}
                <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                    Terms of Service
                  </button>
                  {" "}and{" "}
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                    Privacy Policy
                  </button>
                </p>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5
                      border-2 border-gray-300 rounded-lg
                      text-gray-700 font-medium hover:border-indigo-600 hover:text-indigo-600
                      transition-all duration-200"
                  >
                    Sign In Instead
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      <span>AES-256 Encrypted</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Zero-Knowledge</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Register;