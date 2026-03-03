import { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID, FOLDER_COLLECTION_ID } from "../appwrite/config";
import { Query, ID, Permission, Role } from "appwrite";
import { useAuth } from "../context/useAuthHook";
import DashboardLayout from "../layouts/DashboardLayout";
import FolderView from "../components/FolderView";
import { 
  Folder, 
  FolderLock, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock,
  X,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Shield
} from "lucide-react";

const FoldersPage = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [newFolder, setNewFolder] = useState({ 
    name: "", 
    password: "", 
    isProtected: false 
  });
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Toast notification function
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FOLDER_COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );
      setFolders(response.documents);
    } catch (error) {
      console.error("Error fetching folders:", error);
      showToast("Failed to load folders", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user, fetchFolders]);

  const createFolder = async () => {
    if (!newFolder.name.trim()) {
      showToast("Folder name is required", "error");
      return;
    }

    if (newFolder.isProtected && !newFolder.password.trim()) {
      showToast("Password is required for protected folders", "error");
      return;
    }

    try {
      await databases.createDocument(
        DATABASE_ID,
        FOLDER_COLLECTION_ID,
        ID.unique(),
        {
          name: newFolder.name,
          password: newFolder.isProtected ? newFolder.password : "",
          userId: user.$id,
          isProtected: newFolder.isProtected,
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );

      await fetchFolders();
      setShowCreateModal(false);
      setNewFolder({ name: "", password: "", isProtected: false });
      showToast("Folder created successfully! 🎉", "success");
    } catch (error) {
      console.error("Error creating folder:", error);
      showToast("Failed to create folder: " + error.message, "error");
    }
  };

  const handleDeleteClick = (folder) => {
    setFolderToDelete(folder);
    setShowDeleteModal(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      await databases.deleteDocument(DATABASE_ID, FOLDER_COLLECTION_ID, folderToDelete.$id);
      await fetchFolders();
      setShowDeleteModal(false);
      setFolderToDelete(null);
      showToast("Folder deleted successfully! 🗑️", "success");
    } catch (error) {
      console.error("Error deleting folder:", error);
      showToast("Failed to delete folder", "error");
    }
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  // Toast Notification Component
  const Toast = () => {
    if (!toast.show) return null;

    return (
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-slide-in">
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-center gap-2 sm:gap-3 
            ${toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          <span className="text-xl sm:text-2xl">
            {toast.type === "success" ? "✓" : "⚠"}
          </span>
          <p className="text-sm sm:text-base font-medium flex-1">{toast.message}</p>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal - Responsive
  const DeleteModal = () => {
    if (!showDeleteModal || !folderToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">
            Delete Folder?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 text-center mb-4 sm:mb-6">
            Are you sure you want to delete "<span className="font-semibold text-gray-800">{folderToDelete.name}</span>"? 
            This action cannot be undone and will delete all files inside.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setFolderToDelete(null);
              }}
              className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 
                rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteFolder}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg 
                font-medium hover:bg-red-600 transition text-sm sm:text-base"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create Folder Modal - Responsive
  const CreateFolderModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Create New Folder</h2>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewFolder({ name: "", password: "", isProtected: false });
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Personal Documents"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 outline-none"
                value={newFolder.name}
                onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="isProtected"
                checked={newFolder.isProtected}
                onChange={(e) => setNewFolder({...newFolder, isProtected: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isProtected" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                Password protect this folder
              </label>
            </div>

            {newFolder.isProtected && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Set Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter folder password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                    border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 
                    focus:border-orange-500 outline-none"
                  value={newFolder.password}
                  onChange={(e) => setNewFolder({...newFolder, password: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users will need this password to access folder contents
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFolder({ name: "", password: "", isProtected: false });
                }}
                className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 
                  rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              
              <button
                onClick={createFolder}
                disabled={!newFolder.name.trim() || (newFolder.isProtected && !newFolder.password.trim())}
                className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 
                  text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 
                  disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If a folder is selected, show its content with password protection
  if (selectedFolder) {
    return (
      <DashboardLayout>
        <FolderView 
          folder={selectedFolder} 
          onBack={handleBackToFolders}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toast />
      <DeleteModal />
      <CreateFolderModal />
      
      <div className="p-4 sm:p-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              Protected Folders
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Secure folders with password protection
            </p>
          </div>
          
          {/* Desktop Button - Hidden on mobile */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="hidden sm:flex items-center justify-center gap-2 px-4 py-2.5 
              bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg 
              font-medium hover:from-blue-600 hover:to-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Folder
          </button>

          {/* Mobile FAB - Visible only on mobile */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="sm:hidden fixed bottom-6 right-6 z-10 w-14 h-14 
              bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
              rounded-full shadow-lg flex items-center justify-center
              hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition-transform"
            aria-label="Create folder"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-xs sm:text-sm text-gray-500">Loading folders...</p>
            </div>
          </div>
        ) : folders.length === 0 ? (
          // Empty State - Responsive
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📁</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">
              No folders yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Create your first password-protected folder
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 
                bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 
                transition text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create First Folder
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Stats - Quick summary */}
            <div className="sm:hidden mb-4 grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">Total Folders</p>
                <p className="text-lg font-bold text-blue-700">{folders.length}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600">Protected</p>
                <p className="text-lg font-bold text-orange-700">
                  {folders.filter(f => f.isProtected).length}
                </p>
              </div>
            </div>

            {/* Folders Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {folders.map((folder) => (
                <div 
                  key={folder.$id} 
                  className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 
                    hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFolder(folder)}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center 
                        ${folder.isProtected ? 'bg-orange-100' : 'bg-blue-100'} flex-shrink-0`}>
                        {folder.isProtected ? (
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        ) : (
                          <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {folder.isProtected ? 'Password protected' : 'Public folder'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Desktop Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(folder);
                      }}
                      className="hidden sm:block text-gray-400 hover:text-red-500 transition p-1"
                      title="Delete folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Mobile Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(folder);
                      }}
                      className="sm:hidden text-gray-400 hover:text-red-500 transition p-1.5"
                      title="Delete folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 sm:mt-4">
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full 
                      ${folder.isProtected 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                      {folder.isProtected ? (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span className="hidden xs:inline">Protected</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Unlock className="w-3 h-3" />
                          <span className="hidden xs:inline">Public</span>
                        </span>
                      )}
                    </span>
                    
                    <button
                      onClick={() => setSelectedFolder(folder)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 
                        bg-blue-50 text-blue-600 text-xs sm:text-sm rounded-lg 
                        font-medium hover:bg-blue-100 transition"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Mobile-only quick actions */}
                  <div className="sm:hidden flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <div className="flex-1 text-xs text-gray-500">
                      Created {new Date(folder.$createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Stats - Hidden on mobile */}
            <div className="hidden sm:flex items-center justify-between mt-6 text-xs sm:text-sm text-gray-600">
              <span>
                Showing {folders.length} folder{folders.length !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-400">
                {folders.filter(f => f.isProtected).length} protected,{' '}
                {folders.filter(f => !f.isProtected).length} public
              </span>
            </div>
          </>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        /* Extra small devices */
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
          
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default FoldersPage;