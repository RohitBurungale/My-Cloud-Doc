import { Link, useNavigate, useLocation } from "react-router-dom";
import { account } from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  FileText,
  Folder,
  Star,
  Trash2,
  User,
  Shield,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Bell,
  Search,
  Cloud,
  File,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Zap,
  Globe,
  Fingerprint,
  Sparkles,
  Lock,
  Users
} from "lucide-react";
import {
  databases,
  DATABASE_ID,
  COLLECTION_ID,
  FOLDER_COLLECTION_ID,
} from "../appwrite/config";
import { Query } from "appwrite";

const DashboardLayout = ({ children }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Storage and file stats
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    fileCount: 0,
    folderCount: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    } catch {
      return "Just now";
    }
  };

  // Fetch user data and generate notifications
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.$id) return;

      try {
        setLoading(true);
        console.log("Fetching data for user:", user.$id);

        const newNotifications = [];

        // Fetch all user documents
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("userId", user.$id), Query.equal("isDeleted", false)],
        );

        const documents = response.documents;
        console.log("Documents found:", documents.length);

        // Calculate total storage used
        const totalBytes = documents.reduce(
          (acc, doc) => acc + (doc.fileSize || 0),
          0,
        );

        // Get folder count (try/catch in case collection doesn't exist)
        let folderCount = 0;
        try {
          if (FOLDER_COLLECTION_ID) {
            const foldersResponse = await databases.listDocuments(
              DATABASE_ID,
              FOLDER_COLLECTION_ID,
              [Query.equal("userId", user.$id)],
            );
            folderCount = foldersResponse.total;
            console.log("Folders found:", folderCount);
          }
        } catch (err) {
          console.log(
            "Folders collection not found or not configured",
            err.message,
          );
        }

        setStorageStats({
          used: totalBytes,
          total: 5 * 1024 * 1024 * 1024,
          fileCount: documents.length,
          folderCount: folderCount,
        });

        // Generate notifications
        const timestamp = Date.now();

        // 1. Storage warning notification
        const usedPercent = (totalBytes / (5 * 1024 * 1024 * 1024)) * 100;
        if (usedPercent > 80) {
          newNotifications.push({
            id: `storage-${timestamp}`,
            type: "warning",
            icon: <HardDrive className="w-4 h-4 text-amber-600" />,
            title: "Storage Almost Full",
            message: `You've used ${usedPercent.toFixed(1)}% of your storage`,
            time: "Just now",
            read: false,
            action: "/dashboard",
            createdAt: new Date().toISOString(),
          });
        }

        // 2. Recent uploads (last 3 files)
        const recentFiles = [...documents]
          .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt))
          .slice(0, 3);

        recentFiles.forEach((file, index) => {
          newNotifications.push({
            id: `file-${file.$id}-${timestamp}`,
            type: "upload",
            icon: <File className="w-4 h-4 text-amber-600" />,
            title: "File Uploaded",
            message: `"${file.fileName || "Unnamed file"}" was added to your documents`,
            time: formatRelativeTime(file.$createdAt),
            read: index === 0 ? false : true,
            action: "/documents",
            createdAt: file.$createdAt,
          });
        });

        // 3. Expiring items from trash
        try {
          const trashResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal("userId", user.$id), Query.equal("isDeleted", true)],
          );

          console.log("Trash items found:", trashResponse.documents.length);

          const expiringItems = trashResponse.documents.filter((doc) => {
            if (!doc.$updatedAt) return false;
            const daysInTrash = Math.floor(
              (Date.now() - new Date(doc.$updatedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return daysInTrash >= 25 && daysInTrash < 30;
          });

          expiringItems.forEach((item, index) => {
            const daysInTrash = Math.floor(
              (Date.now() - new Date(item.$updatedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            const daysLeft = 30 - daysInTrash;
            newNotifications.push({
              id: `expire-${item.$id}-${timestamp}`,
              type: "expiring",
              icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
              title: "File Expiring Soon",
              message: `"${item.fileName || "Unnamed file"}" will be permanently deleted in ${daysLeft} days`,
              time: `${daysLeft} days left`,
              read: false,
              action: "/trash",
              createdAt: item.$updatedAt,
            });
          });
        } catch (err) {
          console.log("Trash fetch error:", err.message);
        }

        // Sort notifications by date (most recent first)
        const sortedNotifications = newNotifications.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        console.log("Generated notifications:", sortedNotifications.length);
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

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
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setIsDropdownOpen(false);
  }, [location]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const usedPercent = (storageStats.used / storageStats.total) * 100;
  const usedGB = (storageStats.used / (1024 * 1024 * 1024)).toFixed(1);
  const totalGB = (storageStats.total / (1024 * 1024 * 1024)).toFixed(0);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-amber-900/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        ref={mobileMenuRef}
        className={`fixed md:hidden top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-amber-200 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with Document Icon */}
        <div className="px-5 py-6 flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <div className="absolute -left-1.5 -top-1.5 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                <FileText className="w-2.5 h-2.5 text-amber-600" />
              </div>
              
              <div className="w-11 h-11 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Cloud className="w-5.5 h-5.5 text-white relative z-10" />
              </div>
              
              <div className="absolute -right-1.5 -bottom-1.5 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center animate-pulse delay-300 shadow-sm">
                <Lock className="w-2.5 h-2.5 text-orange-600" />
              </div>
              
              <div className="absolute -right-3 top-1/2 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-50" />
              <div className="absolute -left-3 bottom-1/2 w-1 h-1 bg-orange-300 rounded-full animate-ping delay-500 opacity-50" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent tracking-tight">
                  CloudDoc
                </span>
                
                <div className="flex items-center gap-1 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse delay-150"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-300"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                  <Shield className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-medium text-amber-700">Secure</span>
                </div>
                
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-200">
                  <Zap className="w-3 h-3 text-orange-600" />
                  <span className="text-[10px] font-medium text-orange-700">Fast</span>
                </div>
                
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                  <Globe className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-medium text-amber-700">Global</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-5 bg-gradient-to-br from-amber-50 to-white border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-200">
                {avatarLetter}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <File className="w-3 h-3" />
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* Storage Indicator */}
          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-amber-600 flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3.5 h-3.5" />
                Storage Usage
              </span>
              <span className="text-amber-700 font-semibold">
                {usedGB} GB / {totalGB} GB
              </span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2 shadow-inner">
              <div
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  usedPercent > 90
                    ? "bg-gradient-to-r from-amber-500 to-orange-600"
                    : usedPercent > 70
                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                      : "bg-gradient-to-r from-amber-600 to-orange-600"
                }`}
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <MobileNavItem
            to="/dashboard"
            icon={<Home className="w-4 h-4" />}
            active={location.pathname === "/dashboard"}
          >
            Dashboard
          </MobileNavItem>

          <MobileNavItem
            to="/documents"
            icon={<FileText className="w-4 h-4" />}
            active={location.pathname === "/documents"}
          >
            Documents
          </MobileNavItem>

          <MobileNavItem
            to="/folders"
            icon={<Folder className="w-4 h-4" />}
            active={location.pathname === "/folders"}
          >
            Protected Folders
          </MobileNavItem>

          <MobileNavItem
            to="/favorites"
            icon={<Star className="w-4 h-4" />}
            active={location.pathname === "/favorites"}
          >
            Favorites
          </MobileNavItem>

          <MobileNavItem
            to="/trash"
            icon={<Trash2 className="w-4 h-4" />}
            active={location.pathname === "/trash"}
          >
            Trash
          </MobileNavItem>

          <div className="pt-4 mt-4 border-t border-amber-200">
            <MobileNavItem
              to="/profile"
              icon={<User className="w-4 h-4" />}
              active={location.pathname === "/profile"}
            >
              Profile
            </MobileNavItem>

            <MobileNavItem
              to="/privacy"
              icon={<Shield className="w-4 h-4" />}
              active={location.pathname === "/privacy"}
            >
              Privacy Policy
            </MobileNavItem>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-amber-50 via-white to-transparent border-t border-amber-200">
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-3 rounded-lg border border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 hover:border-amber-500 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-amber-200 flex-col shadow-sm">
        <div className="px-6 py-6 border-b border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute -left-1 -top-1 w-3 h-3 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-2 h-2 text-amber-500" />
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                CloudDoc
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-500">Secure</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem
            to="/dashboard"
            icon={<Home className="w-4 h-4" />}
            active={location.pathname === "/dashboard"}
          >
            Dashboard
          </NavItem>
          <NavItem
            to="/documents"
            icon={<FileText className="w-4 h-4" />}
            active={location.pathname === "/documents"}
          >
            Documents
          </NavItem>
          <NavItem
            to="/folders"
            icon={<Folder className="w-4 h-4" />}
            active={location.pathname === "/folders"}
          >
            Protected Folders
          </NavItem>
          <NavItem
            to="/favorites"
            icon={<Star className="w-4 h-4" />}
            active={location.pathname === "/favorites"}
          >
            Favorites
          </NavItem>
          <NavItem
            to="/trash"
            icon={<Trash2 className="w-4 h-4" />}
            active={location.pathname === "/trash"}
          >
            Trash
          </NavItem>

          <div className="pt-6 mt-6 border-t border-amber-200">
            <NavItem
              to="/privacy"
              icon={<Shield className="w-4 h-4" />}
              active={location.pathname === "/privacy"}
            >
              Privacy Policy
            </NavItem>
          </div>
        </nav>

        {/* Storage Info */}
        <div className="p-5 border-t border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-amber-600 flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5" />
              Storage
            </span>
            <span className="text-amber-700 font-semibold">
              {usedGB} GB / {totalGB} GB
            </span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2 mb-4 shadow-inner">
            <div
              className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                usedPercent > 90
                  ? "bg-gradient-to-r from-amber-500 to-orange-600"
                  : usedPercent > 70
                    ? "bg-gradient-to-r from-amber-500 to-amber-600"
                    : "bg-gradient-to-r from-amber-600 to-orange-600"
              }`}
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            ></div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                <File className="w-3 h-3 text-amber-600" />
              </div>
              <span className="text-xs text-amber-600 font-medium">{storageStats.fileCount} files</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                <Folder className="w-3 h-3 text-orange-600" />
              </div>
              <span className="text-xs text-orange-600 font-medium">{storageStats.folderCount} folders</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-lg border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 hover:border-amber-500 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-amber-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Document Icon & Welcome */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-amber-100 rounded-full"></div>
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center shadow-sm border border-amber-100">
                    <FileText className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                </div>
                <div className="h-6 w-px bg-amber-200"></div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">
                    <span className="text-slate-500 font-normal">
                      Welcome back,{" "}
                    </span>
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                      {user?.name || "User"}
                    </span>
                  </h1>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 mt-0.5 font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-2.5 mr-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200">
                <File className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">
                  {storageStats.fileCount} files
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200">
                <Folder className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700">
                  {storageStats.folderCount} folders
                </span>
              </div>
            </div>

            {/* Storage Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200 shadow-sm">
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">{usedGB} GB / {totalGB} GB</span>
            </div>

            {/* Users Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full border border-orange-200 shadow-sm">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">10k+ Users</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full text-white text-xs flex items-center justify-center font-semibold shadow-lg shadow-amber-200 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-amber-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-amber-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-amber-800">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-8 text-center">
                          <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-amber-500 font-medium">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.action || "#"}
                            className={`block px-4 py-3 border-b border-amber-100 hover:bg-amber-50 transition-colors ${
                              !notif.read ? "bg-amber-50/40" : ""
                            }`}
                            onClick={() => {
                              markAsRead(notif.id);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex-shrink-0">
                                {notif.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-amber-400 mt-1 font-medium">
                                  {notif.time}
                                </p>
                              </div>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></span>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                          <p className="text-sm text-amber-500 font-medium">
                            No notifications
                          </p>
                          <p className="text-xs text-amber-400 mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-white border-t border-amber-200 text-center">
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center font-semibold text-sm
                  hover:shadow-lg hover:shadow-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                  transition-all duration-200"
              >
                {avatarLetter}
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-amber-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-amber-200">
                      <p className="text-sm font-semibold text-amber-800">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-amber-500 mt-1 font-medium">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 font-medium"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-amber-500" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/privacy"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 font-medium"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Privacy Policy</span>
                      </Link>
                      <div className="border-t border-amber-100 my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 w-full text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

// Desktop Navigation Item
const NavItem = ({ to, icon, children, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm border border-amber-200"
        : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
    }`}
  >
    <span className={`${active ? "text-amber-600" : "text-slate-400"}`}>
      {icon}
    </span>
    <span className="font-medium flex-1">{children}</span>
    {active && (
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shadow-sm"></span>
    )}
  </Link>
);

// Mobile Navigation Item
const MobileNavItem = ({ to, icon, children, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm border border-amber-200"
        : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
    }`}
  >
    <span className={active ? "text-amber-600" : "text-slate-400"}>
      {icon}
    </span>
    <span className="font-medium flex-1">{children}</span>
  </Link>
);