import { Link } from "react-router-dom";
import { Cloud, Shield, Zap, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-blue-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo with Icon */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-lg blur-sm group-hover:bg-blue-200 transition-all" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
              <Cloud className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-wide text-gray-800 group-hover:text-blue-600 transition-colors">
              My Cloud Doc
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:block">Secure Storage</span>
          </div>
        </Link>


        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Security Badge - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">256-bit Encrypted</span>
          </div>

          {/* CTA Button */}
          <Link
            to="/register"
            className="px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 
              text-white font-semibold hover:from-blue-700 hover:to-blue-800 
              transition-all shadow-sm hover:shadow-md 
              flex items-center gap-2 text-sm sm:text-base"
          >
            <span>Get Started</span>
            <Zap className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-blue-100 py-2 px-4 animate-slide-down">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/features"
              className="px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="px-4 py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile Security Badge */}
            <div className="flex items-center gap-1.5 px-4 py-3 mt-2 bg-blue-50 rounded-lg border border-blue-100">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">256-bit Encrypted</span>
            </div>
          </nav>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Navbar;