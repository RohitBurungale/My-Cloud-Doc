import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { encryptFile, decryptFile } from "../utils/crypto";
import {
  storage,
  databases,
  BUCKET_ID,
  DATABASE_ID,
  COLLECTION_ID,
} from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const scrollContainerRef = useState(null);

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  /* ---------------- Fetch Active Documents ---------------- */
  const fetchDocuments = async () => {
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
  };

  /* ---------------- Fetch Trash Count ---------------- */
  const fetchTrashCount = async () => {
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
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchTrashCount();
    }
  }, [user]);

  /* ---------------- Handle File Selection ---------------- */
  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
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
    
    setScrollPosition(scrollLeft);
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
          className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm ${
            toast.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
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

      {/* COMPACT HEADER */}
      <div className="mb-4">
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

      {/* COMPACT STATS - Single Row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-xl font-bold text-gray-900">{total}</p>
            </div>
            <Folder className="w-4 h-4 text-blue-500" />
          </div>
        </div>
        
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Favorites</p>
              <p className="text-xl font-bold text-gray-900">{favorites}</p>
            </div>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
        
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Trash</p>
              <p className="text-xl font-bold text-gray-900">{trashCount}</p>
            </div>
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
        </div>
      </div>

      {/* COMPACT UPLOAD + SEARCH - Smaller */}
      <div className="flex gap-2 mb-4">
        {/* Tiny Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg border border-gray-300 
              bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 
              focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 
                text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Small Upload Button */}
        <label
          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs
          bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 
          transition-colors cursor-pointer ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">Upload</span>
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

      {/* SELECTED FILES - Only when files are selected */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-800">Selected Files</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                {selectedFiles.length}
              </span>
            </div>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {selectedFiles.slice(0, 2).map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-700 truncate">{file.name}</span>
                <span className="text-gray-500">{formatFileSize(file.size)}</span>
              </div>
            ))}
            {selectedFiles.length > 2 && (
              <div className="text-xs text-gray-500">
                +{selectedFiles.length - 2} more files
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENT DOCUMENTS - HORIZONTAL SCROLLABLE SECTION */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Recent Documents</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {filteredDocs.length} items
            </span>
            <div className="flex gap-1">
              <button
                onClick={scrollLeft}
                className={`p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded ${
                  !showLeftScroll ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                disabled={!showLeftScroll}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={scrollRight}
                className={`p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded ${
                  !showRightScroll ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                disabled={!showRightScroll}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <File className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {search ? "No documents found" : "No documents yet"}
            </p>
            <p className="text-xs text-gray-500">
              {search ? "Try a different search" : "Upload your first document"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Scroll Button */}
            {showLeftScroll && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
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
                    className="bg-white border border-gray-200 rounded-lg p-4 min-w-[280px] 
                      hover:shadow-md transition-all flex-shrink-0"
                  >
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${getFileIconColor(doc.fileName)} bg-gray-50`}>
                        <File className="w-5 h-5" />
                      </div>
                      {doc.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="mb-4">
                      <p className="font-medium text-gray-900 truncate mb-2" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.$createdAt)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Encrypted
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 
                          text-xs text-gray-700 bg-white border border-gray-300 rounded-lg 
                          hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 
                          text-xs text-white bg-blue-600 border border-blue-600 rounded-lg 
                          hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>

                      <button
                        onClick={() => moveToTrash(doc)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 
                          rounded-lg border border-gray-300 hover:border-red-300 transition-colors"
                        title="Move to trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Right Scroll Button */}
            {showRightScroll && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
                  bg-white border border-gray-300 rounded-l-lg p-2 shadow-md 
                  hover:bg-gray-50 transition-colors"
                style={{ marginRight: '-1px' }}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {/* Scroll Indicator Dots */}
            {filteredDocs.length > 3 && (
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`w-1.5 h-1.5 rounded-full ${
                      dot === 1 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPACT SECURITY INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <Lock className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800 mb-1">Security Information</p>
            <p className="text-xs text-blue-700">
              All files are encrypted with AES-256 before storage. Only you have access to your decrypted files.
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
      `}</style>
    </DashboardLayout>
  );
};

export default Dashboard;