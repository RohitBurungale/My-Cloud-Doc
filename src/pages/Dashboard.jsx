import { useEffect, useState, useCallback } from "react";
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
  Lock,
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", false),
      ]
    );

    setDocuments(res.documents);
  }, [user]);

  /* ---------------- Fetch Trash Count ---------------- */
  const fetchTrashCount = useCallback(async () => {
    if (!user) return;

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", true),
      ]
    );

    setTrashCount(res.total);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchTrashCount();
    }
  }, [user, fetchDocuments, fetchTrashCount]);

  /* ---------------- Handle File Selection ---------------- */
  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  /* ---------------- ENCRYPT BEFORE UPLOAD ---------------- */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);

    try {
      for (const file of files) {
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
          ]
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
          ]
        );
      }

      fetchDocuments();
      fetchTrashCount();
      setSelectedFiles([]);
      showToast("Files uploaded successfully", "success");
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Failed to upload files", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ---------------- VIEW (DECRYPT + PREVIEW) ---------------- */
  const handleView = async (doc) => {
    try {
      const res = await fetch(
        storage.getFileDownload(BUCKET_ID, doc.fileId)
      );

      const encryptedBlob = await res.blob();
      const decryptedBlob = await decryptFile(encryptedBlob);

      const ext = doc.fileName.split(".").pop().toLowerCase();
      const mimeMap = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        txt: "text/plain",
      };

      const mimeType = mimeMap[ext] || "application/octet-stream";
      const viewBlob = new Blob([decryptedBlob], { type: mimeType });

      const url = URL.createObjectURL(viewBlob);
      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast("File opened successfully", "success");
    } catch (err) {
      console.error("View failed:", err);
      showToast("Failed to view file", "error");
    }
  };

  /* ---------------- DOWNLOAD (DECRYPT + SAVE) ---------------- */
  const handleDownload = async (doc) => {
    try {
      const res = await fetch(
        storage.getFileDownload(BUCKET_ID, doc.fileId)
      );

      const encryptedBlob = await res.blob();
      const decryptedBlob = await decryptFile(encryptedBlob);

      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      a.click();

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
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { isDeleted: true }
      );

      fetchDocuments();
      fetchTrashCount();
      showToast("Document moved to trash", "success");
    } catch (err) {
      console.error("Move to trash failed:", err);
      showToast("Failed to move to trash", "error");
    }
  };

  /* ---------------- Stats ---------------- */
  const total = documents.length;
  const favorites = documents.filter((d) => d.isFavorite).length;

  // Filter documents based on search
  const filteredDocs = documents.filter((doc) =>
    search === "" || doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  // Horizontal scroll functions
  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    const container = document.getElementById("scrollContainer");
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("scrollContainer");
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Check scroll position on load and resize
  useEffect(() => {
    const checkScroll = () => {
      const container = document.getElementById("scrollContainer");
      if (container) {
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        setShowRightScroll(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [filteredDocs]);

  // Toast Component
  const Toast = () => {
    if (!toast.show) return null;
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs sm:text-sm ${
            toast.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
            toast.type === "success" ? "bg-green-100" : "bg-red-100"
          }`}>
            <span className={`text-xs font-bold ${toast.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {toast.type === "success" ? "✓" : "!"}
            </span>
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      </div>
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get file icon color based on type
  const getFileIconColor = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const colors = {
      pdf: "text-red-500",
      doc: "text-blue-500",
      docx: "text-blue-500",
      txt: "text-gray-500",
      jpg: "text-green-500",
      jpeg: "text-green-500",
      png: "text-green-500",
      xls: "text-emerald-500",
      xlsx: "text-emerald-500",
      ppt: "text-orange-500",
      pptx: "text-orange-500",
    };
    return colors[ext] || "text-gray-700";
  };

  return (
    <DashboardLayout>
      <Toast />

      {/* MOBILE HEADER WITH MENU */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.name || user?.email}
            </p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2 animate-fade-in">
            <div className="text-xs text-gray-500 px-3 py-2">
              Secure Cloud Storage
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP HEADER - Hidden on mobile */}
      <div className="hidden md:block mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">
              Welcome, {user?.name || user?.email}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Secure Cloud Storage
          </div>
        </div>
      </div>

      {/* COMPACT STATS - Responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{total}</p>
            </div>
            <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Favorites</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{favorites}</p>
            </div>
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Trash</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{trashCount}</p>
            </div>
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          </div>
        </div>
      </div>

      {/* COMPACT UPLOAD + SEARCH - Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search Bar - Full width on mobile */}
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-6 py-2 sm:py-1.5 text-xs sm:text-sm rounded-lg border border-gray-300 
              bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 
              focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 
                text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Upload Button - Full width on mobile */}
        <label
          className={`flex items-center justify-center gap-1 px-3 py-2 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm
          bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 
          transition-colors cursor-pointer w-full sm:w-auto ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Upload Files</span>
            </>
          )}
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={(e) => {
              handleFileSelect(e);
              handleFileChange(e);
            }}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* SELECTED FILES - Mobile optimized */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-blue-800">Selected Files</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                {selectedFiles.length}
              </span>
            </div>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1.5">
            {selectedFiles.slice(0, 3).map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">
                  {file.name}
                </span>
                <span className="text-gray-500 ml-2">{formatFileSize(file.size)}</span>
              </div>
            ))}
            {selectedFiles.length > 3 && (
              <div className="text-xs sm:text-sm text-gray-500">
                +{selectedFiles.length - 3} more files
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENT DOCUMENTS - HORIZONTAL SCROLLABLE SECTION */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Recent Documents</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              {filteredDocs.length} items
            </span>
            {/* Desktop scroll buttons */}
            <div className="hidden sm:flex gap-1">
              <button
                onClick={scrollLeft}
                className={`p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded ${
                  !showLeftScroll ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                disabled={!showLeftScroll}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className={`p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded ${
                  !showRightScroll ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                disabled={!showRightScroll}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
            <File className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm sm:text-base font-medium text-gray-700 mb-1">
              {search ? "No documents found" : "No documents yet"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {search ? "Try a different search" : "Upload your first document"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Scroll Button - Hidden on mobile */}
            {showLeftScroll && (
              <button
                onClick={scrollLeft}
                className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
                  bg-white border border-gray-300 rounded-r-lg p-2 shadow-md 
                  hover:bg-gray-50 transition-colors"
                style={{ marginLeft: '-1px' }}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Horizontal Scroll Container */}
            <div 
              id="scrollContainer"
              onScroll={handleScroll}
              className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {filteredDocs
                .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt))
                .map((doc) => (
                  <div
                    key={doc.$id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 
                      min-w-[240px] sm:min-w-[280px] hover:shadow-md transition-all 
                      flex-shrink-0"
                  >
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className={`p-2 sm:p-3 rounded-lg ${getFileIconColor(doc.fileName)} bg-gray-50`}>
                        <File className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      {doc.isFavorite && (
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="mb-3 sm:mb-4">
                      <p className="font-medium text-sm sm:text-base text-gray-900 truncate mb-1 sm:mb-2" 
                         title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.$createdAt)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded">
                          AES-256 Encrypted
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 
                          text-xs text-gray-700 bg-white border border-gray-300 rounded-lg 
                          hover:bg-gray-50 hover:border-gray-400 transition-colors w-full sm:flex-1"
                      >
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 
                          text-xs text-white bg-blue-600 border border-blue-600 rounded-lg 
                          hover:bg-blue-700 transition-colors w-full sm:flex-1"
                      >
                        <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => moveToTrash(doc)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 sm:p-2 
                          text-gray-500 hover:text-red-600 hover:bg-red-50 
                          rounded-lg border border-gray-300 hover:border-red-300 
                          transition-colors w-full sm:w-auto"
                        title="Move to trash"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Right Scroll Button - Hidden on mobile */}
            {showRightScroll && (
              <button
                onClick={scrollRight}
                className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
                  bg-white border border-gray-300 rounded-l-lg p-2 shadow-md 
                  hover:bg-gray-50 transition-colors"
                style={{ marginRight: '-1px' }}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Scroll Indicator Dots - Only on mobile */}
            {filteredDocs.length > 2 && (
              <div className="flex sm:hidden justify-center gap-1 mt-3">
                {Array.from({ length: Math.min(5, filteredDocs.length) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === 0 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPACT SECURITY INFO - Responsive */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <div className="flex items-start">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
              Military-Grade Encryption
            </p>
            <p className="text-xs sm:text-sm text-blue-700">
              All files are encrypted with AES-256 before storage. 
              <span className="hidden sm:inline"> Only you have access to your decrypted files.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Hide default scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
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

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .min-w-[240px] {
            min-width: 240px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;