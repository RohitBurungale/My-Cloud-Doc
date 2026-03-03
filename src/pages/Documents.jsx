import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { encryptFile, decryptFile } from "../utils/crypto";

import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTION_ID,
  BUCKET_ID,
} from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import { ID, Query } from "appwrite";
import {
  Search,
  Upload,
  Star,
  StarOff,
  Eye,
  Download,
  Edit2,
  Trash2,
  File,
  Loader2,
  X,
  ChevronDown,
  Filter,
} from "lucide-react";

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [toast, setToast] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  /* ---------------- Fetch Documents ---------------- */
  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", false),
      ]);
      setDocuments(res.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /* ---------------- Upload ---------------- */
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        // 🔐 Encrypt original file
        const encryptedBlob = await encryptFile(file);

        // ✅ Wrap encrypted blob in FormData with filename
        const formData = new FormData();
        formData.append("file", encryptedBlob, file.name + ".enc");

        const uploaded = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          formData.get("file"),
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
        );
      }

      fetchDocuments();
      setToast("Files uploaded successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Encrypted upload failed:", error);
      setToast("Upload failed");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /*-------------------download---------------*/
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setToast("File downloaded successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Download failed:", error);
      setToast("Download failed");
      setTimeout(() => setToast(""), 3000);
    }
  };

  /* ---------------- Actions ---------------- */
  const toggleFavorite = async (doc) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        isFavorite: !doc.isFavorite,
      });
      fetchDocuments();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const moveToTrash = async (doc) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { isDeleted: true }
      );

      setToast("Document moved to trash successfully");
      fetchDocuments();

      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error moving to trash:", error);
    }
  };

  const renameDocument = async (doc) => {
    if (!newFileName.trim()) {
      setRenamingId(null);
      return;
    }

    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        fileName: newFileName,
      });
      setRenamingId(null);
      setNewFileName("");
      fetchDocuments();
      setToast("Document renamed successfully");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error renaming document:", error);
    }
  };

  /* ---------------- Search & Sort ---------------- */
  const filteredDocs = documents
    .filter((doc) =>
      doc.fileName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.$createdAt) - new Date(b.$createdAt);
      } else if (sortBy === "name") {
        return a.fileName.localeCompare(b.fileName);
      } else if (sortBy === "size") {
        return b.fileSize - a.fileSize;
      }
      return 0;
    });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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

  const handleView = async (doc) => {
    try {
      // 1. Download encrypted file
      const response = await fetch(
        storage.getFileDownload(BUCKET_ID, doc.fileId)
      );

      const encryptedBlob = await response.blob();

      // 2. Decrypt file
      const decryptedBlob = await decryptFile(encryptedBlob);

      // 3. Detect file type from name
      const extension = doc.fileName.split(".").pop().toLowerCase();

      const mimeTypes = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        txt: "text/plain"
      };

      const mimeType = mimeTypes[extension] || "application/octet-stream";

      // 4. Create previewable blob
      const previewBlob = new Blob([decryptedBlob], { type: mimeType });

      // 5. Open in new tab
      const url = URL.createObjectURL(previewBlob);
      window.open(url, "_blank");

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("View failed:", error);
      setToast("Failed to view file");
      setTimeout(() => setToast(""), 3000);
    }
  };

  // Toast Component
  const Toast = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-fade-in">
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm sm:text-base text-center sm:text-left">
          {toast}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Toast />

      {/* Page Header - Responsive */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Documents</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Manage and organize all your uploaded documents in one place.
        </p>
      </div>

      {/* Actions Bar - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        {/* Search Bar - Full width on mobile */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base
              rounded-lg border border-gray-300 bg-white 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 
                text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="flex gap-2 sm:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
              bg-gray-100 text-gray-700 rounded-lg font-medium
              hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <label
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
              bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 
              active:bg-blue-800 transition-colors cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-3 animate-slide-down">
            <label className="block text-xs font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A-Z</option>
              <option value="size">Size (largest)</option>
            </select>
          </div>
        )}

        {/* Desktop Upload Button - Hidden on mobile */}
        <label
          className="hidden sm:flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 
            bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 
            active:bg-blue-800 transition-colors duration-200 cursor-pointer 
            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm md:text-base"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 md:w-5 md:h-5" />
              Upload Document
            </>
          )}
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Desktop Sort - Hidden on mobile */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        {filteredDocs.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {filteredDocs.length} of {documents.length} documents
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg
              focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size (largest)</option>
          </select>
        </div>
      </div>

      {/* Mobile Count - Visible only on mobile */}
      {filteredDocs.length > 0 && (
        <div className="sm:hidden mb-3 text-xs text-gray-600">
          {filteredDocs.length} of {documents.length} documents
        </div>
      )}

      {/* Documents Grid - Responsive */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDocs.length === 0 ? (
          <div
            className="col-span-full bg-white rounded-xl border border-gray-200 
            p-6 sm:p-8 md:p-12 text-center"
          >
            <File className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">
              {search ? "No documents found" : "No documents yet"}
            </p>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              {search
                ? "Try a different search term"
                : "Upload your first document to get started"}
            </p>
            {!search && (
              <label
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5
                  bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium 
                  hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                Upload Document
                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.$id}
              className="bg-white rounded-xl border border-gray-200 
                hover:border-gray-300 hover:shadow-lg transition-all duration-200 
                overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-3 sm:p-4 md:p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div
                    className={`p-2 sm:p-2.5 md:p-3 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}
                  >
                    <File className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <button
                    onClick={() => toggleFavorite(doc)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={
                      doc.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {doc.isFavorite ? (
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* File Name */}
                <div className="min-h-[48px] sm:min-h-[56px]">
                  {renamingId === doc.$id ? (
                    <div className="space-y-2">
                      <input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameDocument(doc);
                          if (e.key === "Escape") {
                            setRenamingId(null);
                            setNewFileName("");
                          }
                        }}
                        autoFocus
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm 
                          border border-gray-300 rounded-lg focus:outline-none 
                          focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-1.5 sm:gap-2">
                        <button
                          onClick={() => renameDocument(doc)}
                          className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 
                            text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setRenamingId(null);
                            setNewFileName("");
                          }}
                          className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-200 
                            text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                      {doc.fileName}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 sm:p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    {formatFileSize(doc.fileSize)}
                  </span>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    {new Date(doc.$createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* First Row - View & Download */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 
                        px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm 
                        text-gray-700 bg-white border border-gray-300 rounded-lg 
                        hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">View</span>
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 
                        px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm 
                        text-white bg-blue-600 border border-blue-600 rounded-lg 
                        hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Download</span>
                    </button>
                  </div>

                  {/* Second Row - Rename & Trash */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRenamingId(doc.$id);
                        setNewFileName(doc.fileName);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 
                        px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm 
                        text-gray-700 bg-white border border-gray-300 rounded-lg 
                        hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Rename</span>
                    </button>

                    <button
                      onClick={() => moveToTrash(doc)}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 
                        px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm 
                        text-red-600 bg-white border border-red-200 rounded-lg 
                        hover:bg-red-50 hover:border-red-300 transition-colors"
                      title="Move to trash"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Trash</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Animation Styles */}
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
            transform: translateY(-10px);
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
          animation: slideDown 0.2s ease-out;
        }

        /* Extra small devices (320px and up) */
        @media (min-width: 320px) {
          .xs\\:inline {
            display: inline;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, .cursor-pointer {
            min-height: 44px;
          }
          
          input, select {
            font-size: 16px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Documents;