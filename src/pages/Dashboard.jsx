import { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { encryptFile, decryptFile } from "../utils/crypto";
import {
  storage,
  databases,
  BUCKET_ID,
  DATABASE_ID,
  COLLECTION_ID,
} from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import { ID, Query, Permission, Role } from "appwrite";
import {
  File,
  Folder,
  Star,
  Trash2,
  Upload,
  Eye,
  Download,
  Search,
  X,
  Loader2,
  HardDrive,
  Grid,
  List,
  Filter,
  PieChart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const recentScrollRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRecentScroll, setShowRecentScroll] = useState(false);

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  /* ---------------- Fetch Active Documents ---------------- */
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", false),
      ]);
      setDocuments(res.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* ---------------- Fetch Trash Count ---------------- */
  const fetchTrashCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", true),
      ]);
      setTrashCount(res.total);
    } catch (error) {
      console.error("Error fetching trash count:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchTrashCount();
    }
  }, [user, fetchDocuments, fetchTrashCount]);

  // Check if recent documents need scroll buttons
  useEffect(() => {
    const checkRecentScroll = () => {
      if (recentScrollRef.current) {
        const { scrollWidth, clientWidth } = recentScrollRef.current;
        setShowRecentScroll(scrollWidth > clientWidth);
      }
    };

    checkRecentScroll();
    window.addEventListener("resize", checkRecentScroll);
    return () => window.removeEventListener("resize", checkRecentScroll);
  }, [documents]);

  /* ---------------- Handle File Selection ---------------- */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setSelectedFiles(files);
      setShowUploadModal(true);
    }
  };

  /* ---------------- ENCRYPT BEFORE UPLOAD ---------------- */
  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    setShowUploadModal(false);

    try {
      for (const file of selectedFiles) {
        const encryptedBlob = await encryptFile(file);

        const formData = new FormData();
        formData.append("file", encryptedBlob, file.name + ".enc");

        const uploaded = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          formData.get("file"),
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        );

        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            userId: user.$id,
            fileId: uploaded.$id,
            fileName: file.name,
            fileSize: file.size,
            isFavorite: false,
            isDeleted: false,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        );
      }

      await fetchDocuments();
      await fetchTrashCount();
      setSelectedFiles([]);
      showToast("Files uploaded successfully", "success");
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Failed to upload files", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* ---------------- VIEW (DECRYPT + PREVIEW) ---------------- */
  const handleView = async (doc) => {
    try {
      showToast("Preparing file for viewing...", "success");
      const res = await fetch(storage.getFileDownload(BUCKET_ID, doc.fileId));
      const encryptedBlob = await res.blob();
      const decryptedBlob = await decryptFile(encryptedBlob);

      const ext = doc.fileName.split(".").pop().toLowerCase();
      const mimeMap = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        txt: "text/plain",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
      const mimeType = mimeMap[ext] || "application/octet-stream";
      const viewBlob = new Blob([decryptedBlob], { type: mimeType });

      const url = URL.createObjectURL(viewBlob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("View failed:", err);
      showToast("Failed to view file", "error");
    }
  };

  /* ---------------- DOWNLOAD (DECRYPT + SAVE) ---------------- */
  const handleDownload = async (doc) => {
    try {
      showToast("Preparing download...", "success");
      const res = await fetch(storage.getFileDownload(BUCKET_ID, doc.fileId));
      const encryptedBlob = await res.blob();
      const decryptedBlob = await decryptFile(encryptedBlob);

      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("File downloaded successfully", "success");
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Failed to download file", "error");
    }
  };

  /* ---------------- Move to Trash ---------------- */
  const moveToTrash = async (doc) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        isDeleted: true,
      });
      await fetchDocuments();
      await fetchTrashCount();
      showToast("Document moved to trash", "success");
    } catch (err) {
      console.error("Move to trash failed:", err);
      showToast("Failed to move to trash", "error");
    }
  };

  /* ---------------- Toggle Favorite ---------------- */
  const toggleFavorite = async (doc) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        isFavorite: !doc.isFavorite,
      });
      await fetchDocuments();
      showToast(
        doc.isFavorite ? "Removed from favorites" : "Added to favorites",
        "success",
      );
    } catch (err) {
      console.error("Toggle favorite failed:", err);
      showToast("Failed to update favorite", "error");
    }
  };

  /* ---------------- Scroll Function ---------------- */
  const scrollRecent = (direction) => {
    if (recentScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        recentScrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      recentScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  /* ---------------- Stats (FIXED CALCULATION) ---------------- */
  const total = documents.length;
  const favorites = documents.filter((d) => d.isFavorite).length;

  // FIX: Properly calculate total storage with fallback for undefined/null values
  const totalStorageUsed = documents.reduce((acc, doc) => {
    const fileSize = doc.fileSize || 0;
    return acc + fileSize;
  }, 0);

  // FIX: Handle edge cases and ensure proper number formatting
  const storageGB =
    totalStorageUsed > 0
      ? (totalStorageUsed / (1024 * 1024 * 1024)).toFixed(2)
      : "0.00";

  const storageMB =
    totalStorageUsed > 0
      ? (totalStorageUsed / (1024 * 1024)).toFixed(2)
      : "0.00";

  // Display in MB if less than 1GB, otherwise GB
  const storageDisplay =
    parseFloat(storageGB) >= 1 ? `${storageGB} GB` : `${storageMB} MB`;

  const storagePercent = Math.min(
    (totalStorageUsed / (5 * 1024 * 1024 * 1024)) * 100,
    100,
  ).toFixed(1);

  const freeStorageGB = (5 - parseFloat(storageGB)).toFixed(2);

  // Get recent documents (last 7 days)
  const recentDocs = documents
    .filter((doc) => {
      const daysAgo =
        (new Date() - new Date(doc.$createdAt)) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    })
    .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

  // Filter documents for search
  const filteredDocs = documents
    .filter((doc) => {
      if (activeTab === "favorites") return doc.isFavorite;
      return (
        search === "" ||
        doc.fileName.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      if (sortBy === "oldest")
        return new Date(a.$createdAt) - new Date(b.$createdAt);
      if (sortBy === "name") return a.fileName.localeCompare(b.fileName);
      if (sortBy === "size") return (b.fileSize || 0) - (a.fileSize || 0);
      return 0;
    });

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Get file icon and color
  const getFileInfo = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const icons = {
      pdf: { icon: "📕", color: "text-red-600", bg: "bg-red-100" },
      doc: { icon: "📘", color: "text-blue-600", bg: "bg-blue-100" },
      docx: { icon: "📘", color: "text-blue-600", bg: "bg-blue-100" },
      txt: { icon: "📄", color: "text-gray-600", bg: "bg-gray-100" },
      jpg: { icon: "🖼️", color: "text-green-600", bg: "bg-green-100" },
      jpeg: { icon: "🖼️", color: "text-green-600", bg: "bg-green-100" },
      png: { icon: "🖼️", color: "text-green-600", bg: "bg-green-100" },
      gif: { icon: "🎨", color: "text-purple-600", bg: "bg-purple-100" },
      mp4: { icon: "🎥", color: "text-pink-600", bg: "bg-pink-100" },
      mp3: { icon: "🎵", color: "text-indigo-600", bg: "bg-indigo-100" },
      xls: { icon: "📊", color: "text-emerald-600", bg: "bg-emerald-100" },
      xlsx: { icon: "📊", color: "text-emerald-600", bg: "bg-emerald-100" },
      ppt: { icon: "📽️", color: "text-orange-600", bg: "bg-orange-100" },
      pptx: { icon: "📽️", color: "text-orange-600", bg: "bg-orange-100" },
      zip: { icon: "🗜️", color: "text-yellow-600", bg: "bg-yellow-100" },
      rar: { icon: "🗜️", color: "text-yellow-600", bg: "bg-yellow-100" },
    };
    return (
      icons[ext] || { icon: "📄", color: "text-gray-600", bg: "bg-gray-100" }
    );
  };

  // Document Card Component (IMPROVED MOBILE & COMPACT)
  const DocumentCard = ({ doc }) => {
    const fileInfo = getFileInfo(doc.fileName);
    return (
      <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:shadow-lg transition-all group min-w-[220px] sm:min-w-[260px] w-[220px] sm:w-[260px] flex-shrink-0 h-fit">
        <div className="flex items-start justify-between mb-2">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 ${fileInfo.bg} rounded-lg sm:rounded-xl flex items-center justify-center`}
          >
            <span className="text-lg sm:text-xl">{fileInfo.icon}</span>
          </div>
          <button
            onClick={() => toggleFavorite(doc)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                doc.isFavorite
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          </button>
        </div>

        <h4
          className="font-medium text-gray-900 truncate mb-1 text-sm"
          title={doc.fileName}
        >
          {doc.fileName}
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 mb-2">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>•</span>
          <span className="truncate">{formatDate(doc.$createdAt)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleView(doc)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View</span>
          </button>

          <button
            onClick={() => handleDownload(doc)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => moveToTrash(doc)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-300 hover:border-red-300 transition-all"
            title="Move to trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Toast Component
  const Toast = () => {
    if (!toast.show) return null;
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in max-w-[90vw] sm:max-w-md">
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 sm:gap-3 ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium text-sm sm:text-base">
            {toast.message}
          </span>
        </div>
      </div>
    );
  };

  // Upload Modal (IMPROVED MOBILE)
  const UploadModal = () => {
    if (!showUploadModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Upload Files
            </h3>
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFiles([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Selected files ({selectedFiles.length}):
            </p>
            <div className="max-h-48 sm:max-h-60 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <File className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFiles([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="flex-1 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 min-w-[220px] sm:min-w-[260px] w-[220px] sm:w-[260px] flex-shrink-0 animate-pulse"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl"></div>
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3.5 bg-gray-200 rounded mb-1"></div>
          <div className="h-2.5 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="flex gap-1.5">
            <div className="flex-1 h-7 bg-gray-200 rounded"></div>
            <div className="flex-1 h-7 bg-gray-200 rounded"></div>
            <div className="w-7 h-7 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <Toast />
      <UploadModal />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="fileInput"
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Main Dashboard Container - Fixed Height, No Scroll */}
      <div className="h-screen overflow-hidden flex flex-col max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Welcome Header - Compact */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-gray-500 mt-0.5 text-xs sm:text-sm">
            Here's what's happening with your documents today.
          </p>
        </div>

        {/* Stats Overview - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <Folder className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
              <span className="text-base sm:text-lg md:text-xl font-bold">
                {total}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs opacity-90">Total Documents</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
              <span className="text-base sm:text-lg md:text-xl font-bold">
                {favorites}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs opacity-90">Favorites</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
              <span className="text-base sm:text-lg md:text-xl font-bold">
                {storageDisplay}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs opacity-90">Storage Used</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
              <span className="text-base sm:text-lg md:text-xl font-bold">
                {trashCount}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs opacity-90">In Trash</p>
          </div>
        </div>

        {/* Quick Actions - Compact */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4 flex-shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            )}
            <span>{uploading ? "Uploading..." : "Upload Files"}</span>
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-xs sm:text-sm md:text-base"
          >
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">
              {showStats ? "Hide" : "Show"} Stats
            </span>
            <span className="sm:hidden">Stats</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-xs sm:text-sm md:text-base"
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel - Compact */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 animate-slide-down flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="size">Size (Largest)</option>
                  </select>
                  
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Filter By
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Files
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "favorites"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Favorites
                  </button>
                </div>
              </div>
            </div>

            {/* Active filters indicator */}
            {(sortBy !== "newest" || activeTab !== "all") && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {sortBy !== "newest" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                      Sort:{" "}
                      {sortBy === "oldest"
                        ? "Oldest"
                        : sortBy === "name"
                          ? "A-Z"
                          : "Size"}
                      <button
                        onClick={() => setSortBy("newest")}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {activeTab !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs">
                      Filter:{" "}
                      {activeTab === "favorites" ? "Favorites" : activeTab}
                      <button
                        onClick={() => setActiveTab("all")}
                        className="ml-1 hover:text-yellow-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSortBy("newest");
                    setActiveTab("all");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Bar - Compact */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by name..."
              className="block w-full pl-9 pr-20 sm:pr-24 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            />

            <div className="absolute inset-y-0 right-0 flex items-center">
              {search && (
                <>
                  <span className="text-xs text-gray-400 mr-2 hidden sm:block">
                    {filteredDocs.length} result
                    {filteredDocs.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setSearch("")}
                    className="mr-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search results summary */}
          {search && filteredDocs.length === 0 && (
            <div className="mt-2 text-xs sm:text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>No documents found matching "{search}"</span>
            </div>
          )}
        </div>

        {/* Storage Progress - Compact */}
        {showStats && (
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                <span className="font-medium text-gray-700 text-xs sm:text-sm">
                  Storage Usage
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-600">
                {storageDisplay} of 5 GB used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] sm:text-xs text-gray-500">
              <span>Free: {freeStorageGB} GB</span>
              <span>{storagePercent}% used</span>
            </div>
          </div>
        )}

        {/* Recent Documents - Scrollable Section that fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {loading ? (
            <LoadingSkeleton />
          ) : recentDocs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center flex-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <File className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No recent documents
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3">
                Upload your first document to get started
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-xs sm:text-sm"
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Upload Document
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    Recent Documents
                  </h2>
                  <span className="text-xs sm:text-sm text-gray-500">
                    ({recentDocs.length})
                  </span>
                </div>
                {showRecentScroll && (
                  <div className="hidden sm:flex gap-2">
                    <button
                      onClick={() => scrollRecent("left")}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => scrollRecent("right")}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative flex-1 min-h-0">
                {/* Scroll Container */}
                <div
                  ref={recentScrollRef}
                  className="flex gap-3 sm:gap-4 overflow-x-auto h-full pb-2 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {recentDocs.map((doc) => (
                    <DocumentCard key={doc.$id} doc={doc} />
                  ))}
                </div>

                {/* Gradient Fades */}
                {showRecentScroll && (
                  <>
                    <div className="hidden sm:block absolute left-0 top-0 bottom-2 w-8 sm:w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                    <div className="hidden sm:block absolute right-0 top-0 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;
