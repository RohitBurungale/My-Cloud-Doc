import { useState, useEffect } from "react";
import { storage, BUCKET_ID, databases, DATABASE_ID, FILES_COLLECTION_ID } from "../appwrite/config";
import { ID, Query, Permission, Role } from "appwrite";
import { useAuth } from "../context/AuthContext";

const FolderView = ({ folder, onBack }) => {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(!folder.isProtected);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (unlocked) {
      loadFiles();
    }
  }, [unlocked, folder.$id]);

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FILES_COLLECTION_ID,
        [Query.equal("folderId", folder.$id)]
      );
      setFiles(response.documents);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleUnlock = () => {
    if (password === folder.password) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Wrong password. Please try again.");
      setPassword("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && password.trim()) {
      handleUnlock();
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        );

        await databases.createDocument(
          DATABASE_ID,
          FILES_COLLECTION_ID,
          ID.unique(),
          {
            name: file.name,
            fileId: uploadedFile.$id,
            folderId: folder.$id,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
      }
      
      await loadFiles();
      e.target.value = "";
      showToast("Files uploaded successfully! 🎉", "success");
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Failed to upload files: " + error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (file) => {
    try {
      const result = storage.getFileView(BUCKET_ID, file.fileId);
      window.open(result.href, '_blank');
    } catch (error) {
      console.error("View failed:", error);
      showToast("Failed to view file", "error");
    }
  };

  const handleDownload = async (file) => {
    try {
      const result = storage.getFileDownload(BUCKET_ID, file.fileId);
      window.open(result.href, '_blank');
      showToast("Download started! 📥", "success");
    } catch (error) {
      console.error("Download failed:", error);
      showToast("Failed to download file", "error");
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.name}"?`)) return;

    try {
      await storage.deleteFile(BUCKET_ID, file.fileId);
      await databases.deleteDocument(DATABASE_ID, FILES_COLLECTION_ID, file.$id);
      await loadFiles();
      showToast("File deleted successfully! 🗑️", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Failed to delete file", "error");
    }
  };

  const handleLock = () => {
    setUnlocked(false);
    setPassword("");
    setError("");
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      svg: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      mp3: '🎵',
      wav: '🎵',
      zip: '📦',
      rar: '📦',
      xlsx: '📊',
      xls: '📊',
      csv: '📊',
    };
    return iconMap[extension] || '📄';
  };

  // Toast Notification Component
  const Toast = () => {
    if (!toast.show) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div
          className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span className="text-2xl">
            {toast.type === "success" ? "✓" : "⚠"}
          </span>
          <p className="font-medium">{toast.message}</p>
        </div>
      </div>
    );
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <Toast />
        <div className="max-w-md mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
            >
              ← Back to Folders
            </button>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Protected Folder
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Enter password to access <span className="font-semibold text-blue-600">"{folder.name}"</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter folder password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠</span>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={!password.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                🔓 Unlock Folder
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-6">
              Only users with the password can view contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast />
      
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
          >
            ← Back to Folders
          </button>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">📁</span>
              {folder.name}
              {folder.isProtected && (
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  🔓 Unlocked
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              {files.length} {files.length === 1 ? "item" : "items"} in this folder
            </p>
          </div>
          
          {folder.isProtected && (
            <button
              onClick={handleLock}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              🔒 Lock Folder
            </button>
          )}
        </div>

        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Upload Files to Folder</h3>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100"
          />
          {uploading && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading files...</span>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Upload files to this protected folder
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No files yet</h3>
            <p className="text-gray-500">Upload files to this protected folder</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div 
                key={file.$id} 
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getFileIcon(file.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="text-gray-400 hover:text-red-500 transition ml-2 flex-shrink-0"
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleView(file)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg font-medium hover:bg-blue-100 transition"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDownload(file)}
                    className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 text-sm rounded-lg font-medium hover:bg-green-100 transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderView;