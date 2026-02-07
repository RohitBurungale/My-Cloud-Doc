import { useState } from "react";

const FolderGate = ({ folder, onUnlock, onCancel }) => {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPassword = async () => {
    if (!pass.trim()) {
      setError("Please enter password");
      return;
    }

    setLoading(true);
    setError("");

    // In a real app, you'd verify on server
    if (pass === folder.password) {
      onUnlock();
    } else {
      setError("Wrong password. Try again.");
      setPass("");
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkPassword();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          Protected Folder
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Enter password to access <span className="font-semibold text-indigo-600">"{folder.name}"</span>
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
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
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

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              onClick={checkPassword}
              disabled={loading || !pass.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <span>🔓</span>
                  Unlock Folder
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Only users with the password can view contents
        </p>
      </div>
    </div>
  );
};

export default FolderGate;