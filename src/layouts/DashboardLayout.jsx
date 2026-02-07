import { Link, useNavigate } from "react-router-dom";
import { account } from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const DashboardLayout = ({ children }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toast, setToast] = useState("");

  const dropdownRef = useRef(null);

  /* ---------------- Logout ---------------- */
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

  /* ---------------- Close dropdown on outside click ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 bg-gradient-to-b from-indigo-900 to-purple-900 hidden md:flex flex-col shadow-xl">
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

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">
            Welcome,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold">
              {user?.name || "User"}
            </span>{" "}
            👋
          </h1>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold hover:bg-indigo-700 transition-all"
            >
              {avatarLetter}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    to="/account"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    👤 Account
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                  >
                    🚪 Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ---------------- Toast Popup ---------------- */}
        {toast && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {toast}
          </div>
        )}

        {/* ---------------- Page Content ---------------- */}
        <main className="flex-1 p-6">
          {typeof children === "function"
            ? children({ setToast })
            : children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

/* ---------------- Nav Item ---------------- */
const NavItem = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-indigo-100 font-medium hover:bg-white/10 hover:text-white transition-all"
    >
      {children}
    </Link>
  );
};
