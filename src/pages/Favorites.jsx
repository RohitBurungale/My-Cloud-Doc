import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  storage,
  databases,
  BUCKET_ID,
  DATABASE_ID,
  COLLECTION_ID,
} from "../appwrite/config";
import { useAuth } from "../context/useAuthHook";
import { Query } from "appwrite";
import {
  Star,
  Eye,
  Download,
  File,
  Heart,
  ChevronRight,
  Calendar,
  HardDrive,
} from "lucide-react";

const Favorites = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("isFavorite", true),
          Query.equal("isDeleted", false),
        ]
      );
      setDocuments(res.documents);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = async (doc) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { isFavorite: false }
      );
      fetchFavorites();
      if (selectedDoc?.$id === doc.$id) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getFileIconColor = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const colors = {
      pdf: 'text-red-500',
      doc: 'text-blue-500',
      docx: 'text-blue-500',
      txt: 'text-gray-500',
      jpg: 'text-green-500',
      jpeg: 'text-green-500',
      png: 'text-green-500',
      xls: 'text-emerald-500',
      xlsx: 'text-emerald-500',
      ppt: 'text-orange-500',
      pptx: 'text-orange-500',
    };
    return colors[ext] || 'text-gray-700';
  };

  // Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading favorites...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
              Favorites
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Your starred documents for quick access
            </p>
          </div>
          
          {/* Desktop Count - Hidden on mobile */}
          {documents.length > 0 && (
            <div className="hidden sm:block text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              {documents.length} {documents.length === 1 ? 'item' : 'items'}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Count - Visible only on mobile */}
      {documents.length > 0 && (
        <div className="sm:hidden mb-3 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full inline-block">
          {documents.length} {documents.length === 1 ? 'favorite' : 'favorites'}
        </div>
      )}

      {/* Favorites List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          // Empty State - Responsive
          <div className="text-center py-10 sm:py-12 md:py-16 px-4 sm:px-6">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">
              No favorite documents
            </p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              Star documents from your dashboard or documents page to see them here for quick access.
            </p>
            
            {/* Quick Tip */}
            <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Click the star icon on any document</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.$id}
                className="group"
              >
                {/* Desktop View - Hidden on mobile */}
                <div className="hidden sm:flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 
                  transition-colors duration-150">
                  
                  {/* Left Side - File Info */}
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className={`p-2 md:p-2.5 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}>
                      <File className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm md:text-base">
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 md:gap-3 mt-1">
                        <p className="text-xs md:text-sm text-gray-500">
                          {formatFileSize(doc.fileSize)}
                        </p>
                        <span className="text-gray-300 text-xs">•</span>
                        <p className="text-xs md:text-sm text-gray-500">
                          {formatDate(doc.$createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-2 md:gap-3 ml-4">
                    {/* Preview */}
                    <a
                      href={storage.getFileView(BUCKET_ID, doc.fileId)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 
                        text-xs md:text-sm font-medium text-gray-700 bg-white 
                        border border-gray-300 rounded-lg hover:bg-gray-50 
                        hover:border-gray-400 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden lg:inline">View</span>
                    </a>

                    {/* Download */}
                    <a
                      href={storage.getFileDownload(BUCKET_ID, doc.fileId)}
                      className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 
                        text-xs md:text-sm font-medium text-white bg-blue-600 
                        border border-blue-600 rounded-lg hover:bg-blue-700 
                        transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden lg:inline">Download</span>
                    </a>

                    {/* Remove Favorite */}
                    <button
                      onClick={() => removeFavorite(doc)}
                      className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Remove from favorites"
                    >
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                    </button>
                  </div>
                </div>

                {/* Mobile View - Card Layout */}
                <div className="sm:hidden p-4 hover:bg-gray-50 transition-colors">
                  {/* File Header with Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}>
                        <File className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <HardDrive className="w-3 h-3" />
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(doc.$createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => removeFavorite(doc)}
                      className="p-2 -mr-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Remove from favorites"
                    >
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={storage.getFileView(BUCKET_ID, doc.fileId)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5
                        text-sm font-medium text-gray-700 bg-white 
                        border border-gray-300 rounded-lg hover:bg-gray-50 
                        active:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </a>

                    <a
                      href={storage.getFileDownload(BUCKET_ID, doc.fileId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5
                        text-sm font-medium text-white bg-blue-600 
                        border border-blue-600 rounded-lg hover:bg-blue-700 
                        active:bg-blue-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>

                  {/* Expand/Collapse Chevron (optional - for more details) */}
                  {selectedDoc?.$id === doc.$id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Uploaded</span>
                          <p className="font-medium text-gray-900">
                            {new Date(doc.$createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">Size</span>
                          <p className="font-medium text-gray-900">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Count - Mobile & Desktop */}
      {documents.length > 0 && (
        <div className="mt-4 text-xs sm:text-sm text-gray-600 flex items-center justify-between">
          <span>
            {documents.length} favorite {documents.length === 1 ? 'document' : 'documents'}
          </span>
          
          {/* Quick Actions Hint - Desktop only */}
          <span className="hidden sm:block text-gray-400 text-xs">
            Click star to remove from favorites
          </span>
        </div>
      )}

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
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, a {
            min-height: 44px;
          }
          
          .p-2 {
            padding: 0.75rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Favorites;