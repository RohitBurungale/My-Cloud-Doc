import { useState, useEffect } from "react";
import { databases, DATABASE_ID, FOLDER_COLLECTION_ID } from "../appwrite/config";
import { Query, ID, Permission, Role } from "appwrite";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import FolderView from "../components/FolderView";

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

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const fetchFolders = async () => {
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
  };

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

  // Delete Confirmation Modal
  const DeleteModal = () => {
    if (!showDeleteModal || !folderToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            Delete Folder?
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "<span className="font-semibold text-gray-800">{folderToDelete.name}</span>"? 
            This action cannot be undone and will delete all files inside.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setFolderToDelete(null);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteFolder}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
            >
              Delete
            </button>
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
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📁 Protected Folders</h1>
            <p className="text-gray-600 mt-1">Secure folders with password protection</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-2"
          >
            <span>+</span>
            Create Folder
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading folders...</p>
            </div>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No folders yet</h3>
            <p className="text-gray-500 mb-6">Create your first password-protected folder</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition"
            >
              + Create First Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div key={folder.$id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${folder.isProtected ? 'bg-orange-100' : 'bg-blue-100'}`}>
                      <span className="text-lg">
                        {folder.isProtected ? '🔒' : '📁'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{folder.name}</h3>
                      <p className="text-sm text-gray-500">
                        {folder.isProtected ? 'Password protected' : 'Public folder'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(folder);
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Delete folder"
                  >
                    🗑️
                  </button>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-xs px-3 py-1 rounded-full ${folder.isProtected ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {folder.isProtected ? 'Protected' : 'Public'}
                  </span>
                  <button
                    onClick={() => setSelectedFolder(folder)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg font-medium hover:bg-blue-100 transition"
                  >
                    {folder.isProtected ? '🔓 Open' : 'Open'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Folder</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Personal Documents"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newFolder.name}
                    onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isProtected"
                    checked={newFolder.isProtected}
                    onChange={(e) => setNewFolder({...newFolder, isProtected: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isProtected" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Password protect this folder
                  </label>
                </div>

                {newFolder.isProtected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Set Password *
                    </label>
                    <input
                      type="password"
                      placeholder="Enter folder password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      value={newFolder.password}
                      onChange={(e) => setNewFolder({...newFolder, password: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Users will need this password to access folder contents
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewFolder({ name: "", password: "", isProtected: false });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={createFolder}
                    disabled={!newFolder.name.trim() || (newFolder.isProtected && !newFolder.password.trim())}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Create Folder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FoldersPage;