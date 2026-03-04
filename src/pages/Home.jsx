import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { 
  Shield, 
  Cloud, 
  Lock, 
  Zap, 
  Globe, 
  FolderOpen,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  HardDrive,
  Server,
  Key,
  Smartphone,
  Award,
  Clock
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content - FIRST on mobile */}
          <div className="space-y-5 sm:space-y-6 text-center lg:text-left order-1">
            
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 
                bg-blue-50 border border-blue-100 rounded-full">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  Enterprise-Grade Security
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gray-900">Store & Access Your</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Documents Securely
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Professional cloud storage with military-grade encryption. 
              Access your files anywhere, anytime with complete peace of mind.
            </p>

            {/* CTA Buttons - Side by side on mobile */}
            <div className="flex flex-row gap-3 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
              <Link
                to="/register"
                className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-2 
                  px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 
                  bg-blue-600 hover:bg-blue-700
                  text-white font-semibold text-xs sm:text-sm md:text-base rounded-xl 
                  shadow-lg shadow-blue-200
                  transition-all duration-200 transform hover:scale-105">
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 
                  px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 
                  bg-white border-2 border-gray-200 rounded-xl
                  text-gray-700 font-semibold text-xs sm:text-sm md:text-base
                  hover:border-blue-600 hover:text-blue-600
                  transition-all duration-200">
                Sign In
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span>5GB free storage</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col xs:flex-row items-center gap-4 pt-4 border-t border-gray-100 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 
                      border-2 border-white flex items-center justify-center text-white font-semibold text-xs sm:text-sm
                      shadow-md">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-medium">
                  Trusted by 10,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual - SECOND on mobile */}
          <div className="relative flex justify-center mt-8 lg:mt-0 order-2">
            
            {/* Main Card - Clean White Design */}
            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl 
              p-6 sm:p-8 max-w-md w-full transform hover:scale-105 transition-all duration-500">
              
              {/* Decorative Top Bar */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 
                bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" />
              
              {/* Icon */}
              <div className="flex justify-center mb-6 sm:mb-8 mt-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600
                    flex items-center justify-center shadow-xl
                    group-hover:scale-110 transition-transform duration-300">
                    <Cloud className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
                CloudDoc Premium
              </h3>

              {/* Features List */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  { icon: HardDrive, text: "Unlimited Storage", color: "blue" },
                  { icon: Lock, text: "Military-grade Security", color: "indigo" },
                  { icon: Zap, text: "Lightning Fast Access", color: "blue" },
                  { icon: Globe, text: "Access Anywhere", color: "indigo" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl
                    bg-gray-50 hover:bg-blue-50 border border-gray-100
                    hover:border-blue-200 transition-all duration-200">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${feature.color}-50 
                      flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${feature.color}-600`} />
                    </div>
                    <span className="font-semibold text-gray-800 text-sm sm:text-base">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Badge */}
              <div className="text-center pt-4 sm:pt-6 border-t border-gray-100">
                <p className="text-gray-500 font-medium mb-1 text-sm sm:text-base">
                  Your private cloud storage
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Award className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">Join 10,000+ users</span>
                </div>
              </div>
            </div>

            {/* Floating Elements - Subtle */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-50 rounded-full 
              opacity-50 blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-50 rounded-full 
              opacity-50 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose CloudDoc?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Professional-grade features designed for individuals and teams who value security and simplicity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              icon: Shield,
              title: "Bank-Level Security",
              description: "Your files are protected with AES-256 encryption, the same standard used by banks and governments.",
              color: "blue"
            },
            {
              icon: Cloud,
              title: "Automatic Backup",
              description: "Never lose your files. Automatic backup ensures your documents are always safe and recoverable.",
              color: "indigo"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Upload and access your files instantly with our optimized cloud infrastructure.",
              color: "blue"
            },
            {
              icon: Globe,
              title: "Access Anywhere",
              description: "Your files sync across all your devices. Work from anywhere, on any device.",
              color: "indigo"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Share files securely with your team. Control who has access to what.",
              color: "blue"
            },
            {
              icon: Lock,
              title: "Privacy First",
              description: "Zero-knowledge encryption means only you can access your files. Not even we can see them.",
              color: "indigo"
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100
              hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50
              transition-all duration-300">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${feature.color}-50 rounded-lg 
                flex items-center justify-center mb-3 sm:mb-4`}>
                <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mb-8 sm:mb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 
          rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl shadow-blue-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CloudDoc with their important documents. 
            Start your free account today.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 
                bg-white text-blue-600 
                font-semibold text-sm sm:text-base rounded-lg shadow-lg
                hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
              Create Free Account
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          
          <p className="text-blue-100 text-xs sm:text-sm mt-3 sm:mt-4">
            No credit card required • 5GB free storage • Cancel anytime
          </p>
        </div>
      </section>

      {/* Add xs breakpoint styles */}
      <style jsx>{`
        @media (min-width: 480px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;