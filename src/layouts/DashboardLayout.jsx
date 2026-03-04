import { Link, useNavigate, useLocation } from "react-router-dom";
import { account } from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Home, FileText, Folder, Star, Trash2, User, Shield, LogOut } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const avatarLetter = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        ref={mobileMenuRef}
        className={`fixed md:hidden top-0 left-0 h-full w-72 bg-gradient-to-b from-indigo-900 to-purple-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-6 flex items-center justify-between border-b border-purple-800/50">
          <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            My Cloud Doc
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 bg-white/5 border-b border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
              {avatarLetter}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-indigo-200 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <MobileNavItem to="/dashboard" icon={<Home className="w-4 h-4" />}>
            Dashboard
          </MobileNavItem>

          <MobileNavItem to="/documents" icon={<FileText className="w-4 h-4" />}>
            Documents
          </MobileNavItem>

          <MobileNavItem to="/folders" icon={<Folder className="w-4 h-4" />}>
            Protected Folders
          </MobileNavItem>

          <MobileNavItem to="/favorites" icon={<Star className="w-4 h-4" />}>
            Favorites
          </MobileNavItem>

          <MobileNavItem to="/trash" icon={<Trash2 className="w-4 h-4" />}>
            Trash
          </MobileNavItem>

          <div className="pt-4 mt-4 border-t border-purple-800/50">
            <MobileNavItem to="/privacy" icon={<Shield className="w-4 h-4" />}>
              Privacy Policy
            </MobileNavItem>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-indigo-900 to-transparent">
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold hover:from-rose-600 hover:to-pink-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <aside className="hidden md:flex md:w-64 bg-gradient-to-b from-indigo-900 to-purple-900 flex-col shadow-xl">
        <div className="px-6 py-6 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
          My Cloud Doc
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          <NavItem to="/dashboard">📊 Dashboard</NavItem>
          <NavItem to="/documents">📄 Documents</NavItem>
          <NavItem to="/folders">🔐 Protected Folders</NavItem>
          <NavItem to="/favorites">⭐ Favorites</NavItem>
          <NavItem to="/trash">🗑 Trash</NavItem>

          <div className="pt-6 mt-4 border-t border-purple-800/50">
            <NavItem to="/privacy">🔒 Privacy Policy</NavItem>
          </div>
        </nav>

        <div className="p-5 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold hover:from-rose-600 hover:to-pink-700 transition-all shadow-md"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full md:w-auto">

        {/* HEADER FIX */}
        <header className="relative z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
              <span className="hidden xs:inline">Welcome, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold">
                {user?.name || "User"}
              </span>
              <span className="ml-1">👋</span>
            </h1>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md text-sm sm:text-base"
            >
              {avatarLetter}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-[999] overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 sm:py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="text-base">👤</span>
                    <span className="font-medium">Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100 mt-1 pt-2"
                  >
                    <span className="text-base">🚪</span>
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

const NavItem = ({ to, children }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-indigo-100 font-medium hover:bg-white/10 hover:text-white transition-all"
  >
    {children}
  </Link>
);

const MobileNavItem = ({ to, icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-indigo-100 font-medium hover:bg-white/10 hover:text-white transition-all"
  >
    <span className="text-indigo-300">{icon}</span>
    <span>{children}</span>
  </Link>
);