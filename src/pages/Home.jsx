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
  Smartphone
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content - This comes FIRST on mobile */}
          <div className="space-y-5 sm:space-y-6 text-center lg:text-left order-1">
            
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 
                bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/30 rounded-full">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-300">
                  Enterprise-Grade Security
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Store & Access Your</span>
              <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Documents Securely
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-indigo-200/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Professional cloud storage with military-grade encryption. 
              Access your files anywhere, anytime with complete peace of mind.
            </p>

            {/* CTA Buttons - Side by side on mobile */}
            <div className="flex flex-row gap-3 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
              <Link
                to="/register"
                className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-2 
                  px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 
                  bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                  hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
                  text-white font-semibold text-xs sm:text-sm md:text-base rounded-xl 
                  shadow-lg shadow-indigo-600/25
                  transition-all duration-200 transform hover:scale-105">
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 
                  px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 
                  bg-white/10 backdrop-blur-sm border-2 border-indigo-400/30 rounded-xl
                  text-indigo-300 font-semibold text-xs sm:text-sm md:text-base
                  hover:bg-white/20 hover:border-indigo-400 hover:text-white
                  transition-all duration-200">
                Sign In
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {/* Trust Indicators - Stack on very small screens */}
            <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-300">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-300">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span>5GB free storage</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col xs:flex-row items-center gap-4 pt-4 border-t border-indigo-800/50 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 
                      border-2 border-indigo-900 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  ))}
                </div>
                <p className="text-indigo-300 font-medium">
                  Trusted by 10,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual - This comes SECOND on mobile (below content) */}
          <div className="relative flex justify-center mt-8 lg:mt-0 order-2">
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-indigo-950/90 to-purple-950/90 
              backdrop-blur-xl rounded-3xl border border-indigo-500/30 shadow-2xl 
              p-6 sm:p-8 max-w-md w-full transform hover:scale-105 transition-all duration-500">
              
              {/* Icon */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 
                    rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600
                    flex items-center justify-center shadow-xl
                    group-hover:scale-110 transition-transform duration-300">
                    <Cloud className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                CloudDoc Premium
              </h3>

              {/* Features List */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  { icon: HardDrive, text: "Unlimited Storage", color: "indigo" },
                  { icon: Lock, text: "Military-grade Security", color: "purple" },
                  { icon: Zap, text: "Lightning Fast Access", color: "indigo" },
                  { icon: Globe, text: "Access Anywhere", color: "purple" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg
                    bg-indigo-950/50 border border-indigo-500/20
                    hover:bg-indigo-900/50 hover:border-indigo-500/50 transition-all duration-200">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${feature.color}-500/20 
                      flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${feature.color}-400`} />
                    </div>
                    <span className="font-semibold text-indigo-200 text-sm sm:text-base">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Badge */}
              <div className="text-center pt-4 sm:pt-6 border-t border-indigo-800/50">
                <p className="text-indigo-300 font-medium mb-1 text-sm sm:text-base">
                  Your private cloud storage
                </p>
                <div className="flex items-center justify-center gap-2 text-indigo-400">
                  <Users className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">Join 10,000+ users</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full 
              opacity-50 blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full 
              opacity-50 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Why Choose CloudDoc?
          </h2>
          <p className="text-base sm:text-lg text-indigo-200/80 max-w-2xl mx-auto">
            Professional-grade features designed for individuals and teams who value security and simplicity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              icon: Shield,
              title: "Bank-Level Security",
              description: "Your files are protected with AES-256 encryption, the same standard used by banks and governments."
            },
            {
              icon: Cloud,
              title: "Automatic Backup",
              description: "Never lose your files. Automatic backup ensures your documents are always safe and recoverable."
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Upload and access your files instantly with our optimized cloud infrastructure."
            },
            {
              icon: Globe,
              title: "Access Anywhere",
              description: "Your files sync across all your devices. Work from anywhere, on any device."
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Share files securely with your team. Control who has access to what."
            },
            {
              icon: Lock,
              title: "Privacy First",
              description: "Zero-knowledge encryption means only you can access your files. Not even we can see them."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gradient-to-br from-indigo-950/90 to-purple-950/90 
              backdrop-blur-xl rounded-xl p-5 sm:p-6 border border-indigo-500/30
              hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 
              transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-indigo-200/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mb-8 sm:mb-16">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
          rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CloudDoc with their important documents. 
            Start your free account today.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 
                bg-white text-indigo-600 
                font-semibold text-sm sm:text-base rounded-lg shadow-lg
                hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
              Create Free Account
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          
          <p className="text-indigo-100 text-xs sm:text-sm mt-3 sm:mt-4">
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