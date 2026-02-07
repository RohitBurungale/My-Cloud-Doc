import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  storage,
  databases,
  BUCKET_ID,
  DATABASE_ID,
  COLLECTION_ID,
} from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
import { Query } from "appwrite";
import {
  RotateCcw,
  Trash2,
  File,
  Clock,
  AlertCircle,
  Check,
  X,
  Folder,
  Download,
  Eye
} from "lucide-react";

const Trash = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  /* ---------- Fetch Trash ---------- */
  const fetchTrash = async () => {
    if (!user) return;

    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("isDeleted", true),
        ]
      );
      setDocuments(res.documents);
      setSelected([]);
    } catch (error) {
      console.error("Error fetching trash:", error);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [user]);

  /* ---------- Selection ---------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === documents.length) {
      setSelected([]);
    } else {
      setSelected(documents.map((d) => d.$id));
    }
  };

  /* ---------- Restore ---------- */
  const restoreSelected = async () => {
    if (selected.length === 0) return;
    
    try {
      for (const id of selected) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          id,
          { isDeleted: false, deletedAt: null }
        );
      }
      showToast(`${selected.length} item${selected.length > 1 ? 's' : ''} restored successfully`, "success");
      fetchTrash();
    } catch (error) {
      console.error("Error restoring documents:", error);
      showToast("Failed to restore items", "error");
    }
  };

  const restoreSingle = async (id) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        id,
        { isDeleted: false, deletedAt: null }
      );
      showToast("Item restored successfully", "success");
      fetchTrash();
    } catch (error) {
      console.error("Error restoring document:", error);
      showToast("Failed to restore item", "error");
    }
  };

  /* ---------- Delete Forever ---------- */
  const deleteSelected = async () => {
    if (selected.length === 0) return;

    const confirm = window.confirm(
      `Are you sure you want to permanently delete ${selected.length} file${selected.length > 1 ? 's' : ''}? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      for (const id of selected) {
        const doc = documents.find((d) => d.$id === id);
        if (!doc) continue;

        // Try deleting file (ignore 404)
        try {
          await storage.deleteFile(BUCKET_ID, doc.fileId);
        } catch (err) {
          if (err.code !== 404) {
            console.error("Storage delete failed:", err);
          }
        }

        // Always delete DB record
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id
        );
      }
      showToast(`${selected.length} item${selected.length > 1 ? 's' : ''} permanently deleted`, "success");
      fetchTrash();
    } catch (error) {
      console.error("Error deleting documents:", error);
      showToast("Failed to delete items", "error");
    }
  };

  const deleteSingle = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to permanently delete this file? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      const doc = documents.find((d) => d.$id === id);
      if (!doc) return;

      // Try deleting file (ignore 404)
      try {
        await storage.deleteFile(BUCKET_ID, doc.fileId);
      } catch (err) {
        if (err.code !== 404) {
          console.error("Storage delete failed:", err);
        }
      }

      // Always delete DB record
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id
      );
      
      showToast("Item permanently deleted", "success");
      fetchTrash();
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast("Failed to delete item", "error");
    }
  };

  /* ---------- Empty Entire Trash ---------- */
  const emptyTrash = async () => {
    if (documents.length === 0) return;
    
    const confirm = window.confirm(
      `Are you sure you want to permanently delete all ${documents.length} items from trash? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      for (const doc of documents) {
        // Try deleting file (ignore 404)
        try {
          await storage.deleteFile(BUCKET_ID, doc.fileId);
        } catch (err) {
          if (err.code !== 404) {
            console.error("Storage delete failed:", err);
          }
        }

        // Always delete DB record
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id
        );
      }
      showToast("Trash emptied successfully", "success");
      fetchTrash();
    } catch (error) {
      console.error("Error emptying trash:", error);
      showToast("Failed to empty trash", "error");
    }
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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get days since deletion
  const getDaysSinceDeletion = (deletedAt) => {
    if (!deletedAt) return "Unknown";
    const diff = new Date() - new Date(deletedAt);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
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

  // Get file icon component
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) {
      return <File className="w-5 h-5" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
      return <Eye className="w-5 h-5" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <File className="w-5 h-5" />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <File className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  // Toast Component
  const Toast = () => {
    if (!toast.show) return null;
    return (
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <div
          className={`px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] border ${
            toast.type === "success" 
              ? "bg-green-50 text-green-800 border-green-200" 
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            toast.type === "success" ? "bg-green-100" : "bg-red-100"
          }`}>
            <span className={`text-sm font-bold ${toast.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {toast.type === "success" ? "✓" : "!"}
            </span>
          </div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Toast />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Trash</h2>
            <p className="text-gray-600 mt-2">
              Files are automatically deleted after 30 days.
            </p>
          </div>
          {documents.length > 0 && (
            <button
              onClick={emptyTrash}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                bg-red-600 text-white rounded-lg hover:bg-red-700 
                transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Items in Trash</p>
              <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Selected Items</p>
              <p className="text-3xl font-bold text-blue-900">{selected.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium mb-1">Auto Delete In</p>
              <p className="text-3xl font-bold text-amber-900">30 days</p>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selected.length === documents.length && documents.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                    focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {selected.length === documents.length ? "Unselect All" : "Select All"}
                  {selected.length > 0 && ` (${selected.length} selected)`}
                </span>
              </div>
            </div>

            {selected.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={restoreSelected}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                    bg-green-600 text-white rounded-lg hover:bg-green-700 
                    transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore ({selected.length})
                </button>

                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                    bg-red-600 text-white rounded-lg hover:bg-red-700 
                    transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selected.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {documents.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">
                Items will be automatically deleted after 30 days
              </p>
              <p className="text-sm text-red-700">
                Please review and restore important files before they are permanently removed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trash List - Modern Card Grid */}
      <div className="mb-8">
        {documents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Trash is Empty</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Deleted files will appear here. Files are automatically removed after 30 days.
            </p>
            <div className="w-16 h-1.5 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div
                key={doc.$id}
                className={`bg-white rounded-xl border hover:shadow-md transition-all duration-200 overflow-hidden group ${
                  selected.includes(doc.$id) 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left Side - File Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(doc.$id)}
                          onChange={() => toggleSelect(doc.$id)}
                          className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded 
                            focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        
                        <div className={`p-3 rounded-lg bg-gray-100 ${getFileIconColor(doc.fileName)}`}>
                          {getFileIcon(doc.fileName)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {doc.fileName}
                          </p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {doc.fileName.split('.').pop().toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Folder className="w-3.5 h-3.5" />
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Deleted {getDaysSinceDeletion(doc.deletedAt || doc.$updatedAt)} ago</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Uploaded {formatDate(doc.$createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                            Will auto-delete in {30 - parseInt(getDaysSinceDeletion(doc.deletedAt || doc.$updatedAt).split(' ')[0]) || 30} days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => restoreSingle(doc.$id)}
                        className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 
                          rounded-lg border border-gray-300 hover:border-green-300 transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteSingle(doc.$id)}
                        className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 
                          rounded-lg border border-gray-300 hover:border-red-300 transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-5 pb-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          Time remaining
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          {30 - parseInt(getDaysSinceDeletion(doc.deletedAt || doc.$updatedAt).split(' ')[0]) || 30} / 30 days
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ 
                          width: `${Math.max(0, Math.min(100, ((30 - (parseInt(getDaysSinceDeletion(doc.deletedAt || doc.$updatedAt).split(' ')[0]) || 0)) / 30) * 100))}%` 
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-500 to-red-600"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Important Information</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Files in trash are automatically deleted after 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Restored files will return to their original location</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Permanently deleted files cannot be recovered</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trash;