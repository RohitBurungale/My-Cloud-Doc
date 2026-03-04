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
  Users
} from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center md:text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 
              border border-indigo-100 rounded-full">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">
                Enterprise-Grade Security
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900">
              Store & Access Your
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Documents Securely
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Professional cloud storage with military-grade encryption. 
              Access your files anywhere, anytime with complete peace of mind.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  hover:from-indigo-700 hover:to-purple-700
                  text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30
                  transition-all duration-200 transform hover:scale-105">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 
                  border-2 border-gray-300 rounded-lg
                  text-gray-700 font-semibold
                  hover:border-indigo-600 hover:text-indigo-600
                  transition-all duration-200">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>5GB free storage</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200 justify-center md:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 
                      border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-medium">
                  Trusted by 10,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex justify-center">
            
            {/* Main Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 
              p-8 max-w-md w-full transform hover:scale-105 transition-all duration-500">
              
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 
                    rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600
                    flex items-center justify-center shadow-xl
                    group-hover:scale-110 transition-transform duration-300">
                    <Cloud className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
                CloudDoc Premium
              </h3>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: FolderOpen, text: "Unlimited Storage", color: "indigo" },
                  { icon: Lock, text: "Military-grade Security", color: "purple" },
                  { icon: Zap, text: "Lightning Fast Access", color: "indigo" },
                  { icon: Globe, text: "Access Anywhere", color: "purple" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg
                    bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-100
                    hover:shadow-md transition-all duration-200">
                    <div className={`w-10 h-10 rounded-lg bg-${feature.color}-50 
                      flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                    </div>
                    <span className="font-semibold text-gray-800">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Badge */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-gray-600 font-medium mb-1">
                  Your private cloud storage
                </p>
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-semibold">Join 10,000+ users</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full 
              opacity-50 blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100 rounded-full 
              opacity-50 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose CloudDoc?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional-grade features designed for individuals and teams who value security and simplicity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
              hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center
          shadow-2xl shadow-indigo-500/30">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CloudDoc with their important documents. 
            Start your free account today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 
              font-semibold rounded-lg shadow-lg
              hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-indigo-100 text-sm mt-4">
            No credit card required • 5GB free storage • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;