import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { account } from "../appwrite/config";
import {
  Mail,
  User,
  Calendar,
  Shield,
  Copy,
  Check,
  Key,
  Globe,
  AlertTriangle,
  Edit,
  Save,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user?.name]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    const timer = setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
    return () => clearTimeout(timer);
  };

  const copyToClipboard = async (text, type) => {
    if (!text) {
      showToast("Nothing to copy", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
        showToast("Email copied to clipboard", "success");
      } else if (type === "id") {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
        showToast("User ID copied to clipboard", "success");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U";
    const trimmed = name.trim();
    if (!trimmed) return "U";
    return trimmed
      .split(" ")
      .map((word) => word[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (err) {
      return "N/A";
    }
  };

  const handleUpdateName = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      showToast("Name cannot be empty", "error");
      return;
    }
    if (trimmedName === user?.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await account.updateName(trimmedName);
      if (updatedUser && updatedUser.name) {
        setUser({ ...user, name: updatedUser.name });
        setNewName(updatedUser.name);
        showToast("Profile name updated successfully", "success");
        setIsEditing(false);
      }
    } catch (error) {
      showToast(error?.message || "Failed to update name", "error");
      setNewName(user?.name || "");
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEditMode = () => {
    setIsEditing(false);
    setNewName(user?.name || "");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (oldPassword === newPassword) {
      setPasswordError("New password must be different");
      return;
    }

    setIsChangingPassword(true);
    try {
      await account.updatePassword(newPassword, oldPassword);
      setPasswordSuccess("Password changed successfully");
      showToast("Password updated", "success");
      setTimeout(() => {
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setPasswordSuccess("");
      }, 1500);
    } catch (error) {
      setPasswordError("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    setSessionsError("");
    try {
      const sessionsList = await account.listSessions();
      setSessions(Array.isArray(sessionsList?.sessions) ? sessionsList.sessions : []);
    } catch (error) {
      setSessionsError("Failed to load sessions");
      showToast("Failed to load sessions", "error");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await account.deleteSession(sessionId);
      showToast("Session terminated", "success");
      fetchSessions();
    } catch (error) {
      showToast("Failed to terminate session", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      showToast('Type "DELETE" to confirm', "error");
      return;
    }

    setIsDeleting(true);
    try {
      await account.deleteSession("current");
      await account.delete();
      setUser(null);
      showToast("Account deleted", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      showToast("Failed to delete account", "error");
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation("");
  };

  const openSessionsModal = () => {
    setShowSessionsModal(true);
    fetchSessions();
  };

  return (
    <DashboardLayout>
      {toast.show && (
        <div
          className={`fixed top-3 right-4 z-50 px-3 py-2 rounded text-xs shadow-md transition-all duration-500 flex items-center gap-1.5 ${
            toast.type === "success"
              ? "bg-green-50 border-l-4 border-l-green-500 text-green-800"
              : "bg-red-50 border-l-4 border-l-red-500 text-red-800"
          }`}
          role="alert"
        >
          {toast.type === "success" ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="mb-3 animate-slide-down">
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-xs text-gray-600 mt-0.5">Manage your account information</p>
        </div>

        <div
          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-3 animate-slide-down"
          style={{ animationDelay: "100ms" }}
        >
          <div className="h-12 bg-gray-50"></div>
          <div className="px-5 pb-3 pt-2">
            <div className="flex gap-3 items-center">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xl font-semibold border-2 border-gray-100">
                  {getInitials(user?.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      maxLength={100}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateName();
                        if (e.key === "Escape") cancelEditMode();
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateName}
                        disabled={isUpdating || !newName.trim()}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50 hover:bg-blue-700"
                      >
                        {isUpdating ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEditMode} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">FULL NAME</p>
                        <p className="text-base font-semibold text-gray-900">{user?.name || "Not set"}</p>
                      </div>
                      <button
                        onClick={() => {
                          setNewName(user?.name || "");
                          setIsEditing(true);
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs rounded border border-blue-200"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">EMAIL</p>
                    <p className="text-xs text-gray-700">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-200 transition-all animate-slide-down"
                style={{ animationDelay: "200ms" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <button
                    onClick={() => copyToClipboard(user?.email, "email")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-semibold mb-1">EMAIL</p>
                <p className="text-xs text-gray-900 truncate mb-2">{user?.email}</p>
                <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
                  <span className="w-1.5 h-1.5 bg-green-700 rounded-full"></span>Verified
                </div>
              </div>

              <div
                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-purple-200 transition-all animate-slide-down"
                style={{ animationDelay: "250ms" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <button
                    onClick={() => copyToClipboard(user?.$id, "id")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-semibold mb-1">USER ID</p>
                <p className="text-xs text-gray-700 truncate font-mono">{user?.$id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-amber-200 transition-all animate-slide-down" style={{ animationDelay: "300ms" }}>
                <Calendar className="w-4 h-4 text-amber-600 mb-1" />
                <p className="text-xs text-gray-500 font-semibold">MEMBER SINCE</p>
                <p className="text-xs font-semibold text-gray-900">{formatDate(user?.$createdAt)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-green-200 transition-all animate-slide-down" style={{ animationDelay: "350ms" }}>
                <Shield className="w-4 h-4 text-green-600 mb-1" />
                <p className="text-xs text-gray-500 font-semibold">STATUS</p>
                <p className="text-xs font-semibold text-gray-900">Active</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 animate-slide-down" style={{ animationDelay: "400ms" }}>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Email Status</span>
                  <span className="text-green-700">✓ Verified</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Two-Factor</span>
                  <span>Disabled</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Created</span>
                  <span>{formatDate(user?.$createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-3 animate-slide-down" style={{ animationDelay: "450ms" }}>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Security</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
                >
                  <Key className="w-3 h-3" />
                  Change Password
                </button>
                <button
                  onClick={openSessionsModal}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
                >
                  <Globe className="w-3 h-3" />
                  Sessions
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-24 animate-slide-down" style={{ animationDelay: "500ms" }}>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Session</h3>
              <div className="flex gap-2 p-2 bg-gray-50 rounded text-xs">
                <Globe className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Chrome • Windows</p>
                  <p className="text-gray-500 text-xs">Active now</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-red-200 p-3 sticky top-48 animate-slide-down" style={{ animationDelay: "550ms" }}>
              <h3 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Danger Zone
              </h3>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full px-2 py-2 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-sm w-full p-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            {passwordSuccess ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5 text-green-700" />
                </div>
                <p className="text-sm text-green-700 font-semibold">{passwordSuccess}</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Current Password" className="w-full px-3 py-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full px-3 py-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full px-3 py-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {passwordError && <div className="p-2 bg-red-50 rounded"><p className="text-xs text-red-700">{passwordError}</p></div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} disabled={isChangingPassword} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold disabled:opacity-50">
                    {isChangingPassword ? "Updating..." : "Update"}
                  </button>
                  <button onClick={closePasswordModal} className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-sm w-full p-4 max-h-[60vh] overflow-auto shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
              <button onClick={() => setShowSessionsModal(false)} className="p-1"><X className="w-4 h-4" /></button>
            </div>
            {isLoadingSessions ? (
              <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div></div>
            ) : sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.$id} className="border rounded p-2 text-xs hover:bg-gray-50">
                    <div className="flex gap-2 mb-1">
                      <Globe className="w-3 h-3 text-blue-600" />
                      <p className="font-semibold">{session.osName || "Unknown"} • {session.deviceName || "Unknown"}</p>
                      {session.current && <span className="ml-auto bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">Current</span>}
                    </div>
                    <p className="text-gray-500">IP: {session.ip}</p>
                    {!session.current && <button onClick={() => handleDeleteSession(session.$id)} className="mt-1 text-red-600 text-xs">Terminate</button>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">{sessionsError || "No sessions"}</p>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-sm w-full p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-700" />
              <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
            </div>
            <p className="text-xs text-gray-700 mb-4">This is <span className="font-bold">permanent</span>. All data will be deleted. Type "DELETE" below to confirm.</p>
            <input type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())} placeholder='Type "DELETE"' className="w-full px-3 py-2 border-2 border-red-300 rounded text-xs font-mono mb-4 focus:outline-none focus:border-red-500" maxLength={10} />
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmation !== "DELETE"} className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
              <button onClick={closeDeleteModal} className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slideDown 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Profile;