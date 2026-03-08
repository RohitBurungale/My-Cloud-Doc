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
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  /* ---------------- Fetch Documents ---------------- */
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
      showToast("Files uploaded successfully", "success");
    } catch (error) {
      console.error("Encrypted upload failed:", error);
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /*-------------------download---------------*/
  const handleDownload = async (doc) => {
    try {
      showToast("Preparing download...", "success");
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
      
      showToast("File downloaded successfully", "success");
    } catch (error) {
      console.error("Download failed:", error);
      showToast("Download failed", "error");
    }
  };

  /* ---------------- Actions ---------------- */
  const toggleFavorite = async (doc) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        isFavorite: !doc.isFavorite,
      });
      fetchDocuments();
      showToast(
        doc.isFavorite ? "Removed from favorites" : "Added to favorites",
        "success"
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showToast("Failed to update favorite", "error");
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

      showToast("Document moved to trash", "success");
      fetchDocuments();
    } catch (error) {
      console.error("Error moving to trash:", error);
      showToast("Failed to move to trash", "error");
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
      showToast("Document renamed successfully", "success");
    } catch (error) {
      console.error("Error renaming document:", error);
      showToast("Failed to rename document", "error");
    }
  };

  /* ---------------- Search & Sort (FIXED) ---------------- */
  const filteredDocs = documents
    .filter((doc) => {
      // Fixed: Ensure proper filtering
      if (!search.trim()) return true;
      return doc.fileName.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.$createdAt) - new Date(b.$createdAt);
      } else if (sortBy === "name") {
        return a.fileName.localeCompare(b.fileName);
      } else if (sortBy === "size") {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      return 0;
    });

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
      showToast("Preparing file for viewing...", "success");
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
        txt: "text/plain",
        gif: "image/gif",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
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
      showToast("Failed to view file", "error");
    }
  };

  // Toast Component (IMPROVED)
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
          <span className="font-medium text-sm sm:text-base">{toast.message}</span>
        </div>
      </div>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="p-3 sm:p-4 bg-gray-50 space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <Toast />

      {/* Main Container - Fixed Height, No Scroll */}
      <div className="h-screen overflow-hidden flex flex-col max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Page Header - Compact */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Documents</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
            Manage and organize all your uploaded documents in one place.
          </p>
        </div>

        {/* Actions Bar - Compact & Mobile Optimized */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:gap-3 mb-3 sm:mb-4 flex-shrink-0">
          {/* Search Bar - Full width on mobile */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm text-gray-900 placeholder-gray-400
                rounded-lg border border-gray-300 bg-white 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-transparent transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                  text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter & Upload Buttons */}
          <div className="flex gap-2 sm:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                bg-gray-100 text-gray-700 rounded-lg font-medium text-sm
                hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <label
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 
                active:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50"
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

          {/* Desktop Upload Button - Hidden on mobile */}
          <label
            className="hidden sm:flex items-center justify-center gap-2 px-4 py-2
              bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 
              active:bg-blue-800 transition-colors duration-200 cursor-pointer 
              disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm whitespace-nowrap"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
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

        {/* Mobile Filter Panel (FIXED) */}
        {showMobileFilters && (
          <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-3 mb-3 animate-slide-down flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A-Z</option>
              <option value="size">Size (largest)</option>
            </select>
          </div>
        )}

        {/* Desktop Sort & Count - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-between mb-3 flex-shrink-0">
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
              className="px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <div className="sm:hidden mb-2 text-xs text-gray-600 flex-shrink-0">
            {filteredDocs.length} of {documents.length} documents
          </div>
        )}

        {/* Search Results Summary (FIXED) */}
        {search && (
          <div className="mb-2 sm:mb-3 flex-shrink-0">
            {filteredDocs.length === 0 ? (
              <div className="text-xs sm:text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>No documents found matching "{search}"</span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Found {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} matching "{search}"</span>
              </div>
            )}
          </div>
        )}

        {/* Documents Grid - Horizontal Scroll Section (FIXED) */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {loading ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 sm:gap-4 min-w-max">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse w-[280px] sm:w-[320px] flex-shrink-0">
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div
              className="bg-white rounded-xl border border-gray-200 
              p-6 sm:p-8 text-center h-full flex flex-col items-center justify-center"
            >
              <File className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" />
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
            <div className="overflow-x-auto pb-2 h-full">
              <div className="flex gap-3 sm:gap-4 min-w-max h-full">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.$id}
                    className="bg-white rounded-xl border border-gray-200 
                      hover:border-gray-300 hover:shadow-lg transition-all duration-200 
                      overflow-hidden group w-[280px] sm:w-[320px] flex-shrink-0 h-fit"
                  >
                    {/* Card Header */}
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`p-2 sm:p-2.5 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}
                        >
                          <File className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <button
                          onClick={() => toggleFavorite(doc)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
                      <div className="min-h-[40px] sm:min-h-[48px]">
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
                              className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900
                                border border-gray-300 rounded-lg focus:outline-none 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex gap-1.5">
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
                          <p className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 sm:p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">
                          {formatFileSize(doc.fileSize)}
                        </span>
                        <div className="text-[10px] sm:text-xs text-gray-500">
                          {new Date(doc.$createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        {/* First Row - View & Download */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="flex-1 flex items-center justify-center gap-1 
                              px-2 py-1.5 text-xs sm:text-sm 
                              text-gray-700 bg-white border border-gray-300 rounded-lg 
                              hover:bg-gray-50 hover:border-gray-400 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex-1 flex items-center justify-center gap-1 
                              px-2 py-1.5 text-xs sm:text-sm 
                              text-white bg-blue-600 border border-blue-600 rounded-lg 
                              hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Download</span>
                          </button>
                        </div>

                        {/* Second Row - Rename & Trash */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => {
                              setRenamingId(doc.$id);
                              setNewFileName(doc.fileName);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 
                              px-2 py-1.5 text-xs sm:text-sm 
                              text-gray-700 bg-white border border-gray-300 rounded-lg 
                              hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Rename</span>
                          </button>

                          <button
                            onClick={() => moveToTrash(doc)}
                            className="flex-1 flex items-center justify-center gap-1 
                              px-2 py-1.5 text-xs sm:text-sm 
                              text-red-600 bg-white border border-red-200 rounded-lg 
                              hover:bg-red-50 hover:border-red-300 transition-colors"
                            title="Move to trash"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Trash</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

        /* Custom scrollbar for horizontal scrolling */
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E0 transparent;
        }

        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background-color: #CBD5E0;
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background-color: #A0AEC0;
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