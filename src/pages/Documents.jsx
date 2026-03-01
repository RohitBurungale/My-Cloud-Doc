import { useEffect, useState } from "react";
import { encryptFile, decryptFile } from "../utils/crypto";
import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTION_ID,
  BUCKET_ID,
} from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
import { ID, Query } from "appwrite";
import {
  Search,
  Upload,
  File,
  Loader2,
  X,
  Download,
} from "lucide-react";

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ---------------- Fetch Documents ---------------- */
  const fetchDocuments = async () => {
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
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  /* ---------------- Upload ---------------- */
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const encryptedBlob = await encryptFile(file);

        const uploaded = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          encryptedBlob
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
          }
        );
      }

      fetchDocuments();
    } catch (error) {
      console.error("Encrypted upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ---------------- Download ---------------- */
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
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  /* ---------------- Search ---------------- */
  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Documents
        </h1>
        <p className="text-gray-500 mt-2">
          Manage and organize your uploaded files securely.
        </p>
      </div>

      {/* SEARCH + UPLOAD */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              bg-white shadow-sm text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <label
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm
          bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 
          shadow-md cursor-pointer transition"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* DOCUMENT GRID */}
      <div className="max-w-7xl mx-auto">
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <File className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-sm">
              {search ? "No documents found." : "No documents uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.$id}
                className="bg-white border border-gray-200 rounded-2xl p-5 
                hover:shadow-lg transition duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <File className="w-6 h-6 text-blue-500" />
                </div>

                <p className="text-sm font-semibold text-gray-800 truncate mb-2">
                  {doc.fileName}
                </p>

                <p className="text-xs text-gray-500 mb-5">
                  {formatFileSize(doc.fileSize)}
                </p>

                <button
                  onClick={() => handleDownload(doc)}
                  className="w-full text-xs bg-blue-600 text-white py-2 rounded-xl 
                  hover:bg-blue-700 transition"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;