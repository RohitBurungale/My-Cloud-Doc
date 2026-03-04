import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Trash2,
  Clock,
  Globe,
  Mail,
  Key,
  Server,
  Users,
  AlertTriangle,
  CheckCircle,
  Download,
  Copy,
  Fingerprint,
  HardDrive,
  Zap,
  Smartphone,
  Cloud,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0b1d33] via-[#0f2a44] to-[#08162a] text-slate-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/20 mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Privacy & Security</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Your privacy is important to us. Learn how we protect and handle your data.
              </p>
              
              <div className="mt-6 text-sm text-slate-500">
                Last Updated: {currentDate}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <Lock className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-semibold text-white">256-bit AES</h3>
              <p className="text-xs text-slate-400">Military-grade encryption</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <Eye className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-semibold text-white">Zero-Knowledge</h3>
              <p className="text-xs text-slate-400">We can't see your files</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <Clock className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-semibold text-white">30-Day Retention</h3>
              <p className="text-xs text-slate-400">Auto-delete policy</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <Users className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-semibold text-white">GDPR Compliant</h3>
              <p className="text-xs text-slate-400">Your data rights</p>
            </div>
          </div>

          {/* Privacy Policy Sections */}
          <div className="space-y-8">
            {/* 1. Introduction */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                1. Introduction
              </h2>
              <div className="space-y-3 text-slate-300">
                <p>
                  Welcome to Secure Cloud Doc ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cloud document storage service.
                </p>
                <p>
                  By using our service, you consent to the data practices described in this policy. If you do not agree with any part of this privacy policy, please do not use our service.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">2.1 Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><span className="font-medium text-white">Name:</span> Your full name for account identification</li>
                    <li><span className="font-medium text-white">Email Address:</span> Used for login, communication, and account recovery</li>
                    <li><span className="font-medium text-white">Password:</span> Stored securely using bcrypt hashing (never in plain text)</li>
                    <li><span className="font-medium text-white">User ID:</span> Unique identifier for your account</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">2.2 Document Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><span className="font-medium text-white">File Names:</span> Stored for document identification</li>
                    <li><span className="font-medium text-white">File Sizes:</span> Tracked for storage management</li>
                    <li><span className="font-medium text-white">File Metadata:</span> Creation dates, modification dates, favorite status</li>
                    <li><span className="font-medium text-white">File Content:</span> Encrypted with AES-256 before storage</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">2.3 Technical Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><span className="font-medium text-white">IP Address:</span> Collected for security and session management</li>
                    <li><span className="font-medium text-white">Device Information:</span> Browser type, operating system, device type</li>
                    <li><span className="font-medium text-white">Session Data:</span> Active sessions for security monitoring</li>
                    <li><span className="font-medium text-white">Usage Analytics:</span> Anonymous usage patterns to improve service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. How We Protect Your Data */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                3. Security Measures
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <Lock className="w-5 h-5 text-green-400 mb-2" />
                  <h3 className="font-semibold text-white mb-2">AES-256 Encryption</h3>
                  <p className="text-sm text-slate-300">
                    All files are encrypted client-side before upload. Even we cannot decrypt your files without your password.
                  </p>
                </div>
                
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                  <Key className="w-5 h-5 text-blue-400 mb-2" />
                  <h3 className="font-semibold text-white mb-2">Password Protection</h3>
                  <p className="text-sm text-slate-300">
                    Passwords are hashed using bcrypt. Folder passwords are encrypted and never stored in plain text.
                  </p>
                </div>
                
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                  <Fingerprint className="w-5 h-5 text-purple-400 mb-2" />
                  <h3 className="font-semibold text-white mb-2">Session Management</h3>
                  <p className="text-sm text-slate-300">
                    Active sessions are tracked. You can view and terminate sessions from your profile.
                  </p>
                </div>
                
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                  <Trash2 className="w-5 h-5 text-amber-400 mb-2" />
                  <h3 className="font-semibold text-white mb-2">Secure Deletion</h3>
                  <p className="text-sm text-slate-300">
                    Files in trash are permanently deleted after 30 days. Immediate deletion available on request.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Data Storage and Retention */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-cyan-400" />
                4. Data Storage and Retention
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">4.1 Storage Location</h3>
                  <p className="text-slate-300">
                    Your data is stored on secure servers provided by Appwrite. We use industry-standard physical and electronic security measures to protect your information.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-2">4.2 Retention Periods</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><span className="font-medium text-white">Active Documents:</span> Stored until you delete them</li>
                    <li><span className="font-medium text-white">Trash:</span> Retained for 30 days, then permanently deleted</li>
                    <li><span className="font-medium text-white">Account Information:</span> Retained until account deletion</li>
                    <li><span className="font-medium text-white">Session Data:</span> Active until logout or session expiration</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">Note:</span> Files in trash are automatically and permanently deleted after 30 days. Please restore important files before this period expires.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Your Rights */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                5. Your Privacy Rights
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-white/10 rounded-lg p-3">
                  <h3 className="font-semibold text-white mb-1">Access</h3>
                  <p className="text-xs text-slate-400">View all your personal data</p>
                </div>
                <div className="border border-white/10 rounded-lg p-3">
                  <h3 className="font-semibold text-white mb-1">Correction</h3>
                  <p className="text-xs text-slate-400">Update your information</p>
                </div>
                <div className="border border-white/10 rounded-lg p-3">
                  <h3 className="font-semibold text-white mb-1">Deletion</h3>
                  <p className="text-xs text-slate-400">Delete your account and data</p>
                </div>
                <div className="border border-white/10 rounded-lg p-3">
                  <h3 className="font-semibold text-white mb-1">Export</h3>
                  <p className="text-xs text-slate-400">Download your data</p>
                </div>
                <div className="border border-white/10 rounded-lg p-3">
                  <h3 className="font-semibold text-white mb-1">Restrict</h3>
                  <p className="text-xs text-slate-400">Limit data processing</p>
                </div>
                <div className="border border-white/10 rounded-lg p-3">
                  <h3 className="font-semibold text-white mb-1">Object</h3>
                  <p className="text-xs text-slate-400">Opt-out of processing</p>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-slate-400">
                To exercise any of these rights, please contact us at privacy@secureclouddoc.com
              </p>
            </section>

            {/* 6. Third-Party Services */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                6. Third-Party Services
              </h2>
              
              <div className="space-y-3">
                <p className="text-slate-300">
                  We use the following third-party services:
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Server className="w-4 h-4 text-cyan-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white">Appwrite</h3>
                      <p className="text-xs text-slate-400">Authentication, Database, Storage</p>
                      <p className="text-xs text-slate-500 mt-1">Privacy Policy: <a href="#" className="text-cyan-400 hover:underline">appwrite.io/privacy</a></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Mail className="w-4 h-4 text-cyan-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white">Email Services</h3>
                      <p className="text-xs text-slate-400">Account notifications and updates</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Children's Privacy */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                7. Children's Privacy
              </h2>
              <p className="text-slate-300">
                Our service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* 8. Changes to This Policy */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                8. Changes to This Policy
              </h2>
              <p className="text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* 9. Contact Us */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                9. Contact Us
              </h2>
              
              <div className="space-y-3">
                <p className="text-slate-300">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>privacy@secureclouddoc.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>123 Security Street, Tech City, TC 12345</span>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center text-sm text-slate-500 border-t border-white/10 pt-8">
            <p>© {new Date().getFullYear()} Secure Cloud Doc. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-cyan-400">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-cyan-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;