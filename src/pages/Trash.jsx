import { useEffect, useState, useRef, useCallback } from "react";
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
  RotateCcw,
  Trash2,
  File,
  Clock,
  Search,
  X,
  Check,
  AlertTriangle,
  MoreVertical,
  ChevronDown,
  Filter,
  Calendar,
  HardDrive,
  Info
} from "lucide-react";

const Trash = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // --- Mini scroll indicator state ---
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    setScrollProgress(maxScroll > 0 ? scrollTop / maxScroll : 0);

    setIsScrolling(true);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 800);
  }, []);

  useEffect(() => {
    return () => clearTimeout(scrollTimeoutRef.current);
  }, []);
  // ------------------------------------

  /* ---------- Fetch Trash ---------- */
  const fetchTrash = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  /* ---------- Search Filter ---------- */
  const filteredDocs = documents
    .filter((doc) =>
      doc.fileName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.$updatedAt || b.$createdAt) - new Date(a.$updatedAt || a.$createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.$updatedAt || a.$createdAt) - new Date(b.$updatedAt || b.$createdAt);
      } else if (sortBy === "name") {
        return a.fileName.localeCompare(b.fileName);
      } else if (sortBy === "expiry") {
        const daysA = calculateDaysAgo(a.$updatedAt || a.$createdAt);
        const daysB = calculateDaysAgo(b.$updatedAt || b.$createdAt);
        return daysB - daysA;
      }
      return 0;
    });

  /* ---------- Selection ---------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === filteredDocs.length) {
      setSelected([]);
    } else {
      setSelected(filteredDocs.map((d) => d.$id));
    }
  };

  /* ---------- Restore ---------- */
  const restoreSelected = async () => {
    if (selected.length === 0) return;
    
    setRestoring(true);
    try {
      for (const id of selected) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          id,
          { isDeleted: false, deletedAt: null }
        );
      }
      await fetchTrash();
    } catch (error) {
      console.error("Error restoring documents:", error);
    } finally {
      setRestoring(false);
    }
  };

  /* ---------- Delete Forever ---------- */
  const deleteSelected = async () => {
    if (selected.length === 0) return;

    setDeleting(true);
    try {
      for (const id of selected) {
        const doc = documents.find((d) => d.$id === id);
        if (!doc) continue;

        // Try deleting file
        try {
          await storage.deleteFile(BUCKET_ID, doc.fileId);
        } catch (err) {
          if (err.code !== 404) {
            console.error("Storage delete failed:", err);
          }
        }

        // Delete DB record
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id
        );
      }
      await fetchTrash();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting documents:", error);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Format Functions ---------- */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const calculateDaysAgo = (dateString) => {
    const deletedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - deletedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      txt: "📄",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
    };
    return icons[ext] || "📄";
  };

  const getFileColor = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const colors = {
      pdf: 'bg-red-50 text-red-600',
      doc: 'bg-blue-50 text-blue-600',
      docx: 'bg-blue-50 text-blue-600',
      txt: 'bg-gray-50 text-gray-600',
      jpg: 'bg-emerald-50 text-emerald-600',
      jpeg: 'bg-emerald-50 text-emerald-600',
      png: 'bg-emerald-50 text-emerald-600',
    };
    return colors[ext] || 'bg-gray-50 text-gray-600';
  };

  const formatRelativeDate = (dateString) => {
    const days = calculateDaysAgo(dateString);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <DashboardLayout>
      {/* MAIN CONTAINER - No scroll on whole page */}
      <div className="h-full flex flex-col">
        {/* HEADER - Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                Trash
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                {documents.length} item{documents.length !== 1 ? 's' : ''} • Auto-deletes in 30 days
              </p>
            </div>
            {/* Desktop user info */}
            <div className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name || user?.email}
            </div>
          </div>
        </div>

        {/* QUICK STATS - Responsive grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">Items</p>
                <p className="text-base sm:text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">Selected</p>
                <p className="text-base sm:text-2xl font-bold text-gray-900">{selected.length}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">Expiring</p>
                <p className="text-base sm:text-2xl font-bold text-gray-900">
                  {documents.filter(d => {
                    const daysAgo = calculateDaysAgo(d.$updatedAt || d.$createdAt);
                    return daysAgo >= 25;
                  }).length}
                </p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS - Responsive */}
        <div className="space-y-2 sm:space-y-0 mb-3 sm:mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search deleted files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm 
                  rounded-lg sm:rounded-xl border border-gray-300 bg-white 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 
                    text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center gap-1 px-3 py-2 bg-gray-100 
                text-gray-700 rounded-lg text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>

            {/* Desktop Select All */}
            <button
              onClick={selectAll}
              className="hidden sm:block px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm 
                rounded-lg sm:rounded-xl border transition-all
                bg-white text-gray-700 border-gray-300 hover:bg-gray-50 
                hover:border-gray-400"
            >
              {selected.length === filteredDocs.length && filteredDocs.length > 0 
                ? "Unselect All" 
                : "Select All"}
            </button>
          </div>

          {/* Mobile Filter Panel */}
          {showMobileFilters && (
            <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-3 animate-slide-down">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Sort & Filter</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A-Z</option>
                    <option value="expiry">Expiring soon</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quick actions</label>
                  <button
                    onClick={selectAll}
                    className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 
                      rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {selected.length === filteredDocs.length && filteredDocs.length > 0 
                      ? "Unselect All" 
                      : "Select All"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Sort - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            {filteredDocs.length} file{filteredDocs.length !== 1 ? 's' : ''} found
          </span>
          
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
              <option value="expiry">Expiring soon</option>
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS - Responsive */}
        {selected.length > 0 && (
          <div className="flex flex-col xs:flex-row gap-2 mb-4">
            <button
              onClick={restoreSelected}
              disabled={restoring}
              className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 
                text-xs sm:text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 
                text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-emerald-700 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {restoring ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden xs:inline">Restore {selected.length}</span>
              <span className="xs:hidden">Restore</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 
                text-xs sm:text-sm font-medium bg-gradient-to-r from-red-500 to-rose-600 
                text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-rose-700 
                transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Delete {selected.length}</span>
              <span className="xs:hidden">Delete</span>
            </button>
          </div>
        )}

        {/* TRASH LIST - Takes remaining space with internal scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile count - visible only on mobile */}
          <div className="sm:hidden flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Deleted Files</h3>
            <span className="text-xs text-gray-500 font-medium">
              {filteredDocs.length} found
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white border border-gray-200 
              rounded-lg sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">
                {search ? "No matching files" : "Trash is empty"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                {search ? "Try adjusting your search terms" : "Deleted files will appear here"}
              </p>
            </div>
          ) : (
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white border border-gray-200 
              rounded-lg sm:rounded-2xl overflow-hidden flex flex-col">
              
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden sm:block flex-1 flex flex-col overflow-hidden">
                {/* Table header - fixed */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50 shrink-0">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 min-w-[900px]">
                    <div className="col-span-1 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected.length === filteredDocs.length && filteredDocs.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                          focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                      />
                    </div>
                    <div className="col-span-4">File Name</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Deleted</div>
                    <div className="col-span-2">Time Left</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>
                
                {/* Scrollable table body with mini scroll indicator */}
                <div className="flex-1 overflow-hidden relative">
                  {/* Mini scroll indicator */}
                  <div
                    className="absolute right-1.5 top-2 bottom-2 w-1 rounded-full z-20 pointer-events-none"
                    style={{ background: 'rgba(203,213,224,0.35)' }}
                  >
                    <div
                      className="w-full rounded-full"
                      style={{
                        height: '28%',
                        transform: `translateY(${scrollProgress * 257}%)`,
                        background: isScrolling
                          ? 'linear-gradient(180deg, #818cf8, #6366f1)'
                          : 'rgba(148,163,184,0.55)',
                        opacity: isScrolling ? 1 : 0.5,
                        boxShadow: isScrolling
                          ? '0 0 6px 1px rgba(99,102,241,0.45)'
                          : 'none',
                        transition:
                          'background 0.35s ease, opacity 0.4s ease, box-shadow 0.35s ease, transform 0.08s linear',
                      }}
                    />
                  </div>

                  {/* Edge fades */}
                  <div
                    className="absolute top-0 left-0 right-0 h-7 z-10 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(249,250,251,0.92) 0%, transparent 100%)',
                      opacity: scrollProgress > 0.02 ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-7 z-10 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(249,250,251,0.92) 0%, transparent 100%)',
                      opacity: scrollProgress < 0.98 ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />

                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto overflow-x-auto"
                  >
                    <div className="min-w-[900px]">
                      {filteredDocs.map((doc) => {
                        const daysAgo = calculateDaysAgo(doc.$updatedAt || doc.$createdAt);
                        const daysLeft = Math.max(0, 30 - daysAgo);
                        const isExpiringSoon = daysLeft < 7;
                        
                        return (
                          <div
                            key={doc.$id}
                            className={`px-6 py-3 border-b border-gray-100 hover:bg-white transition-colors ${
                              isExpiringSoon ? 'bg-red-50/30' : ''
                            }`}
                          >
                            <div className="grid grid-cols-12 gap-4 items-center">
                              {/* Checkbox */}
                              <div className="col-span-1 flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selected.includes(doc.$id)}
                                  onChange={() => toggleSelect(doc.$id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                                    focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                              </div>
                              
                              {/* File name with icon */}
                              <div className="col-span-4 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileColor(doc.fileName)}`}>
                                  <span className="text-sm">{getFileIcon(doc.fileName)}</span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate" title={doc.fileName}>
                                    {doc.fileName}
                                  </h4>
                                </div>
                              </div>
                              
                              {/* File size */}
                              <div className="col-span-2">
                                <span className="text-sm text-gray-600">{formatFileSize(doc.fileSize)}</span>
                              </div>
                              
                              {/* Deleted time */}
                              <div className="col-span-2">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{daysAgo}d ago</span>
                                </div>
                              </div>
                              
                              {/* Time left with progress */}
                              <div className="col-span-2">
                                <div className="space-y-1">
                                  <span className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-amber-600'}`}>
                                    {daysLeft}d left
                                  </span>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isExpiringSoon ? 'bg-red-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="col-span-1">
                                <div className="relative flex justify-end">
                                  <button
                                    onClick={() => setActiveMenu(activeMenu === doc.$id ? null : doc.$id)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  
                                  {activeMenu === doc.$id && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-40"
                                        onClick={() => setActiveMenu(null)}
                                      />
                                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1">
                                        <button
                                          onClick={() => {
                                            setSelected([doc.$id]);
                                            restoreSelected();
                                            setActiveMenu(null);
                                          }}
                                          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                          Restore
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelected([doc.$id]);
                                            setShowDeleteConfirm(true);
                                            setActiveMenu(null);
                                          }}
                                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          Delete Permanently
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden overflow-y-auto p-3 space-y-2">
                {filteredDocs.map((doc) => {
                  const daysAgo = calculateDaysAgo(doc.$updatedAt || doc.$createdAt);
                  const daysLeft = Math.max(0, 30 - daysAgo);
                  const isExpiringSoon = daysLeft < 7;
                  
                  return (
                    <div
                      key={doc.$id}
                      className={`bg-white border border-gray-200 rounded-lg p-3 
                        ${isExpiringSoon ? 'border-red-200 bg-red-50/20' : ''}`}
                    >
                      {/* Header with checkbox and menu */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={selected.includes(doc.$id)}
                            onChange={() => toggleSelect(doc.$id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                              focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileColor(doc.fileName)}`}>
                            <span className="text-sm">{getFileIcon(doc.fileName)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.fileName}
                            </p>
                          </div>
                        </div>
                        
                        {/* Mobile menu button */}
                        <button
                          onClick={() => setActiveMenu(activeMenu === doc.$id ? null : doc.$id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Mobile dropdown menu */}
                        {activeMenu === doc.$id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-3 mt-8 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
                              <button
                                onClick={() => {
                                  setSelected([doc.$id]);
                                  restoreSelected();
                                  setActiveMenu(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Restore
                              </button>
                              <button
                                onClick={() => {
                                  setSelected([doc.$id]);
                                  setShowDeleteConfirm(true);
                                  setActiveMenu(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* File details grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeDate(doc.$updatedAt || doc.$createdAt)}</span>
                        </div>
                      </div>

                      {/* Expiry progress */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${isExpiringSoon ? 'text-red-600' : 'text-amber-600'}`}>
                            {daysLeft} days left
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.round((daysLeft / 30) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isExpiringSoon ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${(daysLeft / 30) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick action buttons for mobile */}
                      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelected([doc.$id]);
                            restoreSelected();
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 
                            text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            setSelected([doc.$id]);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 
                            text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AUTO-DELETE NOTICE - Responsive */}
        <div className="mt-3 sm:mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 
            rounded-lg sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-0.5 sm:mb-1">
                  Auto-delete Notice
                </p>
                <p className="text-xs sm:text-sm text-blue-700">
                  Files are permanently deleted after 30 days. Restore important files before they expire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL - Responsive */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-sm w-full p-4 sm:p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">Delete permanently?</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-semibold text-red-800">
                Delete {selected.length} item{selected.length !== 1 ? 's' : ''} forever?
              </p>
              <p className="text-xs sm:text-sm text-red-700 mt-1 sm:mt-2">
                These files will be permanently removed from storage and cannot be recovered.
              </p>
            </div>

            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 bg-gray-100 
                  rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors 
                  text-xs sm:text-sm font-medium order-2 xs:order-1"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-rose-600 
                  text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-rose-700 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                  text-xs sm:text-sm font-medium flex items-center justify-center gap-2 order-1 xs:order-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }

        /* Extra small devices (320px and up) */
        @media (min-width: 320px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:hidden {
            display: none;
          }
          .xs\\:inline {
            display: inline;
          }
          .xs\\:order-1 {
            order: 1;
          }
          .xs\\:order-2 {
            order: 2;
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

        /* Vertical scrollbar for table body */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f5f9;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
          margin: 4px 0;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
          border: 2px solid #f1f5f9;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Horizontal scrollbar for table */
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f5f9;
        }
        
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
          margin: 0 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
          border: 2px solid #f1f5f9;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Combined scrollbar for both directions */
        .overflow-y-auto.overflow-x-auto::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
        
        /* For Firefox */
        .overflow-y-auto,
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f5f9;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Trash;