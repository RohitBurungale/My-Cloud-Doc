/* home.js */

/* ==================================================
   APPWRITE SETUP
================================================== */


const client = new Appwrite.Client()
  .setEndpoint(window.APPWRITE_CONFIG.endpoint)
  .setProject(window.APPWRITE_CONFIG.project);

const account = new Appwrite.Account(client);
const storage = new Appwrite.Storage(client);
const databases = new Appwrite.Databases(client);

const BUCKET_ID = "6957d9df0019e749a227";
const DATABASE_ID = "6956ba3a003ab5b4406a";
const COLLECTION_ID = "files"; // FIXED: Using the correct collection ID from your original code

let userId = null;
let allFiles = [];
let currentSort = 'newest';
let lastUploadedId = null;
let selectedFilesArray = [];
let isUploading = false;
let favoriteFiles = []; // Track favorite files
let lastBackupTime = null; // Track last backup

/* ==================================================
   DIAGNOSTIC FUNCTION (for debugging)
================================================== */
async function diagnoseUpload() {
  console.clear();
  console.log('🔍 === UPLOAD DIAGNOSTIC TEST ===');
  
  // Check 1: Appwrite Config
  console.log('1️⃣ Appwrite Config:');
  console.log('   - Endpoint:', window.APPWRITE_CONFIG?.endpoint || '❌ NOT LOADED');
  console.log('   - Project ID:', window.APPWRITE_CONFIG?.project || '❌ NOT LOADED');
  
  // Check 2: User Authentication
  console.log('\n2️⃣ User Authentication:');
  console.log('   - User ID:', userId || '❌ NOT SET');
  try {
    const user = await account.get();
    console.log('   - ✅ Session valid:', user.$id);
  } catch (e) {
    console.log('   - ❌ Session invalid:', e.message);
  }
  
  // Check 3: Database Configuration
  console.log('\n3️⃣ Database Configuration:');
  console.log('   - Database ID:', DATABASE_ID);
  console.log('   - Collection ID:', COLLECTION_ID);
  console.log('   - Bucket ID:', BUCKET_ID);
  
  // Check 4: Storage Test
  console.log('\n4️⃣ Testing Storage...');
  try {
    const testFileId = Appwrite.ID.unique();
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const res = await storage.createFile(BUCKET_ID, testFileId, testFile);
    console.log('   - ✅ Storage write test passed');
    console.log('   - File ID:', testFileId);
    
    // Try to delete test file
    try {
      await storage.deleteFile(BUCKET_ID, testFileId);
      console.log('   - ✅ Storage delete test passed');
    } catch (e) {
      console.log('   - ❌ Storage delete failed:', e.message);
    }
  } catch (e) {
    console.log('   - ❌ Storage write test failed:', e.message);
    console.log('   - Error details:', e);
  }
  
  console.log('\n✅ Diagnostic complete. Check console for issues.');
}

/* ==================================================
   PROFILE POPUP FUNCTIONS (for HTML compatibility)
================================================== */

function toggleProfilePopup() {
  const popup = document.getElementById('profilePopup');
  const overlay = document.getElementById('profileOverlay');
  
  if (!popup || !overlay) {
    console.log('Profile popup elements not found');
    return;
  }
  
  if (popup.style.display === 'none' || !popup.style.display) {
    popup.style.display = 'block';
    overlay.style.display = 'block';
  } else {
    popup.style.display = 'none';
    overlay.style.display = 'none';
  }
}

/* ==================================================
   UPDATE FILE LABEL
================================================== */
function updateFileLabel() {
  const fileInput = document.getElementById('fileInput');
  const fileLabel = document.getElementById('fileLabel');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const uploadBtn = document.getElementById('uploadBtn');
  
  if (!fileInput || !fileLabel || !selectedFilesDiv || !uploadBtn) {
    console.error('Required elements not found in updateFileLabel');
    return;
  }
  
  selectedFilesArray = Array.from(fileInput.files);
  
  if (selectedFilesArray.length > 0) {
    fileLabel.textContent = `✓ ${selectedFilesArray.length} file(s) ready`;
    fileLabel.classList.add('has-files');
    fileLabel.style.background = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
    fileLabel.style.color = '#047857';
    fileLabel.style.borderColor = '#6ee7b7';
    fileLabel.style.fontWeight = '600';
    
    if (!isUploading) {
      uploadBtn.disabled = false;
      uploadBtn.style.opacity = '1';
      uploadBtn.style.transform = 'scale(1.02)';
    }
    
    const totalSize = selectedFilesArray.reduce((sum, file) => sum + file.size, 0);
    selectedFilesDiv.innerHTML = `
      <div style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 12px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);">
        <div style="font-weight: 700; color: #0369a1; margin-bottom: 12px; font-size: 15px;">📋 Selected Files (${selectedFilesArray.length})</div>
        <div style="display: grid; gap: 8px;">
          ${selectedFilesArray
            .map((file, idx) => `
              <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: white; border-radius: 10px; border: 1px solid #cffafe; transition: all 0.3s ease; animation: slideInUp 0.3s ease-out ${idx * 0.05}s both; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <span style="font-size: 18px; min-width: 24px;">📄</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="color: #1e293b; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(file.name)}</div>
                  <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">${formatFileSize(file.size)}</div>
                </div>
                <button style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 16px;" data-index="${idx}" class="file-remove-btn" title="Remove">✕</button>
              </div>
            `)
            .join('')}
        </div>
        <div style="margin-top: 12px; padding: 10px 12px; background: white; border-radius: 10px; border: 1px solid #cffafe; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #64748b; font-weight: 500;">📊 Total Size</span>
          <span style="font-weight: 700; color: #0369a1;">${formatFileSize(totalSize)}</span>
        </div>
      </div>
    `;
    
    selectedFilesDiv.querySelectorAll('.file-remove-btn').forEach((btn) => {
      const index = parseInt(btn.getAttribute('data-index'));
      btn.addEventListener('click', () => removeFile(index));
      btn.addEventListener('mouseenter', () => btn.style.background = '#fecaca');
      btn.addEventListener('mouseleave', () => btn.style.background = '#fee2e2');
    });
  } else {
    fileLabel.textContent = '📁 Choose File(s)';
    fileLabel.classList.remove('has-files');
    fileLabel.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
    fileLabel.style.color = '#475569';
    fileLabel.style.borderColor = '#cbd5e1';
    fileLabel.style.fontWeight = '500';
    selectedFilesDiv.innerHTML = '';
    uploadBtn.disabled = true;
    uploadBtn.style.opacity = '0.5';
    uploadBtn.style.transform = 'scale(1)';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function removeFile(index) {
  selectedFilesArray.splice(index, 1);
  
  const dt = new DataTransfer();
  selectedFilesArray.forEach(file => dt.items.add(file));
  document.getElementById('fileInput').files = dt.files;
  
  updateFileLabel();
}

/* ==================================================
   AUTH & INITIALIZATION
================================================== */
async function checkAuth() {
  try {
    // ✅ 1. ALWAYS get user first
    const u = await account.get();
    userId = u.$id;

    const name = u.name || "User";
    const email = u.email || "user@example.com";
    const initial = name.charAt(0).toUpperCase();

    // ✅ 2. Read stored profile
    let storedProfile = JSON.parse(localStorage.getItem("profileData") || "{}");

    // ✅ 3. Initialize profile ONLY once
    if (!storedProfile.fullName) {
      storedProfile = {
        fullName: name,
        nickName: "",
        gender: "",
        country: "",
        language: "",
        timeZone: "",
        email
      };

      localStorage.setItem("profileData", JSON.stringify(storedProfile));
    }

    // ✅ 4. Final values (never overwrite user edits)
    const finalName = storedProfile.fullName;
    const finalInitial = finalName.charAt(0).toUpperCase();

    // Keep quick-access keys in sync
    localStorage.setItem("userName", finalName);
    localStorage.setItem("userInitial", finalInitial);
    localStorage.setItem("userEmail", email);

    /* ================= HEADER ================= */
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const welcomeEl = document.getElementById('welcome');

    if (userNameEl) userNameEl.textContent = finalName;
    if (userAvatarEl) userAvatarEl.textContent = finalInitial;
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${finalName} 👋`;

    /* ================= PROFILE POPUP ================= */
    const popupAvatar = document.querySelector('.popup-avatar');
    const popupName = document.querySelector('.popup-name');

    if (popupAvatar) popupAvatar.textContent = finalInitial;
    if (popupName) popupName.textContent = finalName;

    /* ================= DROPDOWN ================= */
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const dropdownAvatar = document.getElementById('dropdownAvatar');

    if (dropdownUserName) dropdownUserName.textContent = finalName;
    if (dropdownUserEmail) dropdownUserEmail.textContent = email;
    if (dropdownAvatar) dropdownAvatar.textContent = finalInitial;

    /* ================= PROFILE DRAWER ================= */
    const profileName = document.getElementById('profileName');
    const profileAvatar = document.getElementById('profileAvatar');

    if (profileName) profileName.textContent = finalName;
    if (profileAvatar) profileAvatar.textContent = finalInitial;

    /* ================= LOAD APP DATA ================= */
    loadStoredData();
    await loadFiles();
    updateStorageInfo();

  } catch (error) {
    console.error("Auth error:", error);
    location.href = "index.html";
  }
}



/* ==================================================
   LOGOUT
================================================== */
async function logout() {
  console.log('Logging out...');
  try {
    await account.deleteSession('current');
    console.log('✅ Session deleted successfully');
    location.href = "index.html";
  } catch (error) {
    console.error('Logout error:', error);
    location.href = "index.html";
  }
}

/* ==================================================
   STORAGE INFO
================================================== */
async function updateStorageInfo() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Appwrite.Query.equal("userId", userId)]
    );

    let totalBytes = 0;
    res.documents.forEach(doc => {
      totalBytes += doc.fileSize || 0;
    });

    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
    const percentage = (totalGB / 50) * 100;
    const storageText = `${totalGB} GB / 50 GB`;

    // Update sidebar storage
    const storageTextEl = document.getElementById('storageText');
    const storageBarEl = document.getElementById('storageBar');
    
    if (storageTextEl) storageTextEl.textContent = storageText;
    if (storageBarEl) {
      storageBarEl.style.width = Math.min(percentage, 100) + '%';
      
      // Change color based on usage
      if (percentage >= 90) {
        storageBarEl.style.background = '#ef4444'; // Red
      } else if (percentage >= 75) {
        storageBarEl.style.background = '#f59e0b'; // Orange
      } else {
        storageBarEl.style.background = '#4f46e5'; // Blue
      }
    }
    
    // Update dropdown storage
    const dropdownStorageText = document.getElementById('dropdownStorageText');
    const dropdownStorageBar = document.getElementById('dropdownStorageBar');
    
    if (dropdownStorageText) dropdownStorageText.textContent = `${storageText} used`;
    if (dropdownStorageBar) {
      dropdownStorageBar.style.width = Math.min(percentage, 100) + '%';
      
      // Change color based on usage
      if (percentage >= 90) {
        dropdownStorageBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
      } else if (percentage >= 75) {
        dropdownStorageBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
      } else {
        dropdownStorageBar.style.background = 'linear-gradient(90deg, #3b82f6, #1e40af)';
      }
    }
    
    // Show warning if storage is almost full
    if (percentage >= 90) {
      showToast('error', '⚠️ Storage almost full! Only ' + (50 - totalGB).toFixed(2) + ' GB remaining');
    }
  } catch (error) {
    console.error('Storage update error:', error);
  }
}

/* ==================================================
   UPLOAD SINGLE FILE
================================================== */
async function uploadFile(file, fileIndex, totalFiles) {
  const progressBox = document.getElementById('progressBox');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressTime = document.getElementById('progressTime');
  const progressSpeed = document.getElementById('progressSpeed');

  if (!progressBox || !progressBar || !progressText) {
    console.error('Progress elements not found');
    return false;
  }

  progressBox.style.display = 'block';
  
  try {
    // File validation
    if (!file || !file.name) {
      throw new Error('Invalid file');
    }

    // File size check (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 50MB');
    }

    // Update progress text
    const fileName = file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name;
    progressText.textContent = `File ${fileIndex + 1} of ${totalFiles} • ${fileName}`;
    progressBar.style.width = '0%';

    console.log('📤 Uploading:', file.name);

    // Track upload timing
    const startTime = Date.now();
    let uploadedBytes = 0;
    let lastUpdateTime = startTime;
    let lastUploadedBytes = 0;

    // Smooth progress animation with time tracking
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 12 + 3;
      if (progress <= 85) {
        progressBar.style.width = progress + '%';
      }

      // Update elapsed time and speed
      const elapsedMs = Date.now() - startTime;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const elapsedMin = Math.floor(elapsedSec / 60);
      
      let timeStr = '';
      if (elapsedMin > 0) {
        timeStr = `${elapsedMin}m ${elapsedSec % 60}s`;
      } else {
        timeStr = `${elapsedSec}s`;
      }

      // Estimate speed and remaining time (fix: prevent division by zero)
      let remainingStr = 'Calculating...';
      
      if (progress > 5 && elapsedMs > 0) {
        const estimatedTotalMs = (elapsedMs / (progress / 100));
        const estimatedRemainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
        const estimatedRemainingSec = Math.floor(estimatedRemainingMs / 1000);
        
        if (estimatedRemainingSec > 0) {
          remainingStr = estimatedRemainingSec > 60 
            ? `${Math.floor(estimatedRemainingSec / 60)}m ${estimatedRemainingSec % 60}s`
            : `${estimatedRemainingSec}s`;
        } else {
          remainingStr = 'Almost done...';
        }
      }

      if (progressTime) progressTime.textContent = `⏱️ ${timeStr}`;
      if (progressSpeed) progressSpeed.textContent = `⏳ ${remainingStr}`;
      
      const progressSubtext = document.getElementById('progressSubtext');
      if (progressSubtext) progressSubtext.textContent = `${Math.floor(progress)}% complete • ${formatFileSize(file.size)}`;
    }, 200);

    // Upload file
    try {
      const res = await storage.createFile(
        BUCKET_ID,
        Appwrite.ID.unique(),
        file
      );

      clearInterval(progressInterval);
      progressBar.style.width = '95%';

      // Save to database
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        Appwrite.ID.unique(),
        {
          fileId: res.$id,
          fileName: res.name || file.name,
          fileSize: res.sizeOriginal || file.size,
          userId: userId
        }
      );

      progressBar.style.width = '100%';
      
      const totalElapsedMs = Date.now() - startTime;
      const totalElapsedSec = Math.floor(totalElapsedMs / 1000);
      const totalElapsedMin = Math.floor(totalElapsedSec / 60);
      
      // Fix: Ensure valid elapsed time display
      let totalTimeStr = '';
      if (totalElapsedMin > 0) {
        totalTimeStr = `${totalElapsedMin}m ${totalElapsedSec % 60}s`;
      } else if (totalElapsedSec > 0) {
        totalTimeStr = `${totalElapsedSec}s`;
      } else {
        totalTimeStr = 'Less than 1s';
      }
      
      // Fix: Prevent division by zero in speed calculation
      let speed = '0';
      if (totalElapsedMs > 0) {
        speed = (file.size / (totalElapsedMs / 1000) / 1024 / 1024).toFixed(2);
      }

      progressText.textContent = `✅ Upload Complete`;
      const progressSubtext = document.getElementById('progressSubtext');
      if (progressSubtext) progressSubtext.textContent = `${formatFileSize(file.size)} uploaded successfully`;
      if (progressTime) progressTime.textContent = `⏱️ ${totalTimeStr}`;
      
      // Fix: Check if uploadSpeed element exists before updating
      const uploadSpeedEl = document.getElementById('uploadSpeed');
      if (uploadSpeedEl) {
        uploadSpeedEl.textContent = `${speed} MB/s`;
      }
      if (progressSpeed) {
        progressSpeed.textContent = `📊 ${speed} MB/s`;
      }
      
      lastUploadedId = res.$id;
      
      showToast('success', `✅ ${file.name} uploaded in ${totalTimeStr}`);
      return true;
    } catch (error) {
      // Fix: Clear interval on error
      clearInterval(progressInterval);
      
      let errorMsg = error.message || 'Upload failed';
      
      if (error.code === 401 || error.status === 401) {
        errorMsg = 'Session expired';
      } else if (error.code === 413 || error.status === 413) {
        errorMsg = 'File too large';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMsg = 'Connection error';
      }
      
      showToast('error', `❌ ${file.name}: ${errorMsg}`);
      return false;
    }
  } catch (error) {
    console.error('Upload error in uploadFile:', error);
    return false;
  }
}

/* ==================================================
   UPLOAD FUNCTION
================================================== */
async function upload() {
  try {
    // Validate configuration
    if (!window.APPWRITE_CONFIG?.endpoint || !window.APPWRITE_CONFIG?.project) {
      showToast('error', 'Configuration error. Please refresh the page');
      return;
    }
    
    if (isUploading) {
      showToast('error', 'Upload already in progress');
      return;
    }

    if (!userId) {
      showToast('error', 'Please login first');
      setTimeout(() => location.href = 'index.html', 1500);
      return;
    }

    // Verify session
    try {
      await account.get();
    } catch (error) {
      showToast('error', 'Session expired. Please login again');
      setTimeout(() => location.href = 'index.html', 1500);
      return;
    }

    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileLabel = document.getElementById('fileLabel');
    const files = fileInput?.files;

    if (!files || files.length === 0) {
      showToast('error', 'Please select a file');
      return;
    }

    // Start upload
    isUploading = true;
    uploadBtn.disabled = true;
    uploadBtn.textContent = '⏳ Uploading...';
    fileLabel.style.pointerEvents = 'none';
    fileLabel.style.opacity = '0.5';

    let successCount = 0;
    let failCount = 0;

    // Upload all files
    for (let i = 0; i < files.length; i++) {
      const success = await uploadFile(files[i], i, files.length);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Reload data
    console.log('Reloading files and storage...');
    await loadFiles();
    await updateStorageInfo();

    // Show result
    if (files.length === 1) {
      if (successCount === 1) {
        console.log('✅ File uploaded successfully');
      }
    } else {
      if (failCount === 0) {
        showToast('success', `✅ All ${successCount} files uploaded`);
      } else {
        showToast('error', `⚠️ ${successCount} uploaded, ${failCount} failed`);
      }
    }

  } catch (error) {
    console.error('Upload error:', error);
    let errorMsg = 'Upload failed';
    
    if (error.code === 401 || error.status === 401) {
      errorMsg = 'Session expired. Please login again';
    } else if (error.message?.includes('Failed to fetch')) {
      errorMsg = 'Connection error. Check your internet';
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    showToast('error', errorMsg);
  } finally {
    // Reset UI
    isUploading = false;
    const uploadBtn = document.getElementById('uploadBtn');
    const fileLabel = document.getElementById('fileLabel');
    const fileInput = document.getElementById('fileInput');
    const selectedFilesDiv = document.getElementById('selectedFiles');
    const progressBox = document.getElementById('progressBox');

    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.textContent = '⬆️ Upload';
    }
    
    if (fileLabel) {
      fileLabel.style.pointerEvents = 'auto';
      fileLabel.style.opacity = '1';
      fileLabel.textContent = 'Choose File(s)';
    }

    // Clear after delay
    setTimeout(() => {
      if (progressBox) progressBox.style.display = 'none';
      if (fileInput) fileInput.value = '';
      if (selectedFilesDiv) selectedFilesDiv.innerHTML = '';
    }, 1500);
  }
}

/* ==================================================
   LOAD FILES
================================================== */
async function loadFiles() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Appwrite.Query.equal("userId", userId),
        Appwrite.Query.limit(100)
      ]
    );

    allFiles = res.documents.map(d => ({
      $id: d.fileId,
      docId: d.$id,
      name: d.fileName,
      sizeOriginal: d.fileSize,
      mimeType: getMimeTypeFromName(d.fileName),
      $createdAt: d.$createdAt,
      isFavorite: favoriteFiles.includes(d.fileId)
    }));

    sortAndRenderFiles();
    renderRecentDocuments();
    renderFavorites();
  } catch (error) {
    console.error('Load files error:', error);
    showToast("error", "Failed to load files");
  }
}

/* ==================================================
   FAVORITES FUNCTIONALITY
================================================== */
function toggleFavorite(fileId, fileName) {
  const index = favoriteFiles.indexOf(fileId);
  
  if (index > -1) {
    // Remove from favorites
    favoriteFiles.splice(index, 1);
    showToast("info", `⭐ Removed "${fileName}" from favorites`);
  } else {
    // Add to favorites
    favoriteFiles.push(fileId);
    showToast("success", `⭐ Added "${fileName}" to favorites`);
  }
  
  // Save to localStorage
  if (userId) {
    localStorage.setItem(`favoriteFiles_${userId}`, JSON.stringify(favoriteFiles));
  }
  
  // Re-render
  loadFiles();
}

function renderFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  if (!favoritesList) return;
  
  const favorites = allFiles.filter(f => favoriteFiles.includes(f.$id));
  
  if (favorites.length === 0) {
    favoritesList.innerHTML = `
      <div class="empty">
        <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
        <div style="color: #94a3b8; font-size: 14px;">Click the star on any file to add it to favorites</div>
      </div>
    `;
    return;
  }
  
  favoritesList.innerHTML = favorites.slice(0, 4).map(file => {
    const iconClass = getFileIconClass(file.mimeType);
    const icon = getFileIcon(file);
    const safeName = escapeHtml(file.name);
    
    return `
      <div class="favorite-item" onclick="openFile('${file.$id}')" title="Click to open ${safeName}" style="cursor: pointer;">
        <span style="font-size: 20px;">${icon}</span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</div>
          <div style="font-size: 11px; color: #64748b;">${formatFileSize(file.sizeOriginal)}</div>
        </div>
        <span style="color: #f59e0b;">★</span>
      </div>
    `;
  }).join('');
}

/* ==================================================
   BACKUP FUNCTIONALITY
================================================== */
function performBackup() {
  showToast("info", "💾 Starting backup...");
  
  // Simulate backup process
  setTimeout(() => {
    lastBackupTime = new Date();
    if (userId) {
      localStorage.setItem(`lastBackupTime_${userId}`, lastBackupTime.toISOString());
    }
    updateBackupStatus();
    showToast("success", "✅ Backup completed successfully!");
  }, 2000);
}

function updateBackupStatus() {
  const backupStatus = document.getElementById('backupStatus');
  if (!backupStatus) return;
  
  if (!lastBackupTime) {
    backupStatus.textContent = 'Your last backup: Never';
    return;
  }
  
  const now = new Date();
  const diff = now - new Date(lastBackupTime);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  
  let timeText;
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    timeText = `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    timeText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    timeText = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    timeText = 'just now';
  }
  
  backupStatus.textContent = `Your last backup: ${timeText}`;
}

function loadStoredData() {
  if (!userId) return;
  
  // Load favorites
  const storedFavorites = localStorage.getItem(`favoriteFiles_${userId}`);
  if (storedFavorites) {
    try {
      favoriteFiles = JSON.parse(storedFavorites);
    } catch (e) {
      console.error('Error loading favorites:', e);
      favoriteFiles = [];
    }
  }
  
  // Load last backup time
  const storedBackupTime = localStorage.getItem(`lastBackupTime_${userId}`);
  if (storedBackupTime) {
    lastBackupTime = new Date(storedBackupTime);
    updateBackupStatus();
  }
}

/* ==================================================
   RENDER RECENT DOCUMENTS
================================================== */
function renderRecentDocuments() {
  const recentSection = document.getElementById('recentSection');
  const recentList = document.getElementById('recentList');
  
  if (!recentSection || !recentList) return;
  
  // Get the 5 most recent files
  const recentFiles = [...allFiles]
    .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt))
    .slice(0, 5);
  
  if (recentFiles.length === 0) {
    recentSection.style.display = 'none';
    return;
  }
  
  recentSection.style.display = 'block';
  recentList.innerHTML = '';
  
  recentFiles.forEach(file => {
    const timeAgo = getTimeAgo(file.$createdAt);
    const iconClass = getFileIconClass(file.mimeType);
    const icon = getFileIcon(file);
    const safeName = escapeHtml(file.name);
    
    const item = document.createElement('div');
    item.className = 'recent-item';
    item.innerHTML = `
      <div class="recent-icon" style="font-size: 22px;">${icon}</div>
      <div class="recent-info">
        <div class="recent-name">${file.name}</div>
        <div class="recent-meta">${timeAgo}</div>
      </div>
      <div class="recent-actions">
        <button class="recent-btn" onclick="openFile('${file.$id}')">Open</button>
        <button class="recent-btn" onclick="downloadFile('${file.$id}', '${safeName}')">Download</button>
      </div>
    `;
    recentList.appendChild(item);
  });
}

function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
}

/* ==================================================
   SEARCH & FILTER
================================================== */
function filterFiles() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const q = searchInput.value.trim().toLowerCase();
  const filtered = allFiles.filter(f => f.name.toLowerCase().includes(q));
  renderFiles(filtered);
}

/* ==================================================
   SORTING
================================================== */
function toggleSortMenu() {
  const sortMenu = document.getElementById('sortMenu');
  if (sortMenu) {
    sortMenu.classList.toggle('hidden');
  }
}

function setSort(type) {
  currentSort = type;
  const sortMenu = document.getElementById('sortMenu');
  if (sortMenu) {
    sortMenu.classList.add('hidden');
  }
  sortAndRenderFiles();
}

function sortAndRenderFiles() {
  let sorted = [...allFiles];

  switch(currentSort) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
      break;
    case 'az':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'za':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderFiles(sorted);
}

/* ==================================================
   RENDER FILES
================================================== */
function renderFiles(list) {
  const filesContainer = document.getElementById('files');
  if (!filesContainer) return;
  
  filesContainer.innerHTML = "";

  if (!list.length) {
    filesContainer.innerHTML = `<div class="empty">📂 No files found<br><small style="color: #94a3b8;">Upload your first document to get started</small></div>`;
    return;
  }

  list.forEach(f => {
    const card = document.createElement("div");
    card.className = "file-card";
    if (f.$id === lastUploadedId) {
      card.classList.add("highlight");
      setTimeout(() => lastUploadedId = null, 3000);
    }

    const iconClass = getFileIconClass(f.mimeType);
    const icon = getFileIcon(f);
    const isFavorite = favoriteFiles.includes(f.$id);
    const canOpen =
      f.mimeType === "application/pdf" ||
      f.mimeType === "text/html" ||
      f.mimeType?.startsWith("image/") ||
      f.mimeType?.startsWith("text/");

    const safeName = escapeHtml(f.name);
    const timeAgo = getTimeAgo(f.$createdAt);

    card.innerHTML = `
      <button class="favorite-toggle ${isFavorite ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleFavorite('${f.$id}', '${safeName}')" 
              title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
        ${isFavorite ? '★' : '☆'}
      </button>
      <div class="file-preview" style="font-size: 48px; text-align: center; padding: 20px 0;">${icon}</div>
      <div class="file-name" title="${safeName}">${f.name}</div>
      <div class="file-meta">${formatFileSize(f.sizeOriginal)} • ${timeAgo}</div>
      <div class="file-actions">
        <button class="open" onclick="openFile('${f.$id}')" ${!canOpen ? 'disabled' : ''}>Open</button>
        <button class="download" onclick="downloadFile('${f.$id}', '${safeName}')">Download</button>
        <button class="rename" onclick="renameFile('${f.docId}', '${safeName}')">Rename</button>
        <button class="delete" onclick="deleteFile('${f.docId}', '${safeName}')">Delete</button>
      </div>
    `;

    filesContainer.appendChild(card);
  });
}

/* ==================================================
   FILE OPERATIONS
================================================== */
function openFile(fileId) {
  const url = storage.getFileView(BUCKET_ID, fileId);
  window.open(url, "_blank");
}

function downloadFile(fileId, fileName) {
  const cleanName = fileName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const url = storage.getFileDownload(BUCKET_ID, fileId);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  a.click();
  showToast("success", `⬇️ Downloading ${cleanName}`);
}

async function renameFile(docId, oldName) {
  const cleanOldName = oldName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const newName = prompt("Enter new file name:", cleanOldName);
  if (!newName || newName === cleanOldName) return;

  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      docId,
      { fileName: newName }
    );

    showToast("success", "✏️ File renamed");
    await loadFiles();
  } catch (error) {
    console.error('Rename error:', error);
    showToast("error", "Failed to rename file");
  }
}

async function deleteFile(docId, fileName) {
  const cleanFileName = fileName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  if (!confirm(`Are you sure you want to delete "${cleanFileName}"?`)) return;

  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, docId);
    await storage.deleteFile(BUCKET_ID, doc.fileId);
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, docId);

    showToast("success", `🗑️ ${cleanFileName} deleted`);
    await loadFiles();
    updateStorageInfo();
  } catch (error) {
    console.error('Delete error:', error);
    showToast("error", "Failed to delete file");
  }
}

/* ==================================================
   UTILITY FUNCTIONS
================================================== */
function getFileIconClass(mime) {
  if (mime === 'application/pdf') return 'pdf';
  if (mime?.includes('word') || mime?.includes('document')) return 'doc';
  if (mime?.includes('sheet') || mime?.includes('excel')) return 'excel';
  if (mime?.startsWith('image/')) return 'image';
  if (mime?.startsWith('text/')) return 'text';
  return 'other';
}

function getFileIcon(file) {
  const mime = file.mimeType;
  
  if (mime?.startsWith('image/')) return '🖼️';
  if (mime === 'application/pdf') return '📕';
  if (mime?.includes('word') || mime?.includes('document')) return '📘';
  if (mime?.includes('sheet') || mime?.includes('excel')) return '📗';
  if (mime?.includes('presentation') || mime?.includes('powerpoint')) return '📙';
  if (mime?.startsWith('text/')) return '📄';
  if (mime?.startsWith('video/')) return '🎥';
  if (mime?.startsWith('audio/')) return '🎵';
  if (mime?.includes('zip') || mime?.includes('rar') || mime?.includes('7z')) return '📦';
  
  return '📄';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function showToast(type, message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // Add toast styles if they don't exist
  if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }
      .toast.success { background: linear-gradient(135deg, #10b981, #059669); }
      .toast.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
      .toast.info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getMimeTypeFromName(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'html': 'text/html',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/* ==================================================
   PROFILE DRAWER (for compatibility)
================================================== */
function openProfile() {
  const drawer = document.getElementById('profileDrawer');
  const overlay = document.getElementById('profileOverlay');
  if (drawer) drawer.classList.add('active');
  if (overlay) overlay.classList.add('active');
}

function closeProfile() {
  const popup = document.getElementById('profilePopup');
  const drawer = document.getElementById('profileDrawer');
  const overlay = document.getElementById('profileOverlay');
  
  if (popup) popup.style.display = 'none';
  if (drawer) drawer.classList.remove('active');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
}

function goToProfile() {
  window.location.href = "profile.html";
}

function goToDashboard() {
  closeProfile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==================================================
   CLICK OUTSIDE TO CLOSE
================================================== */
document.addEventListener('click', (e) => {
  const sortMenu = document.getElementById('sortMenu');
  if (sortMenu && !e.target.closest('.sort-wrapper')) {
    sortMenu.classList.add('hidden');
  }
  
  const userDropdown = document.getElementById('userDropdownMenu');
  const userSection = document.getElementById('userSection');
  if (userDropdown && !e.target.closest('#userSection') && !e.target.closest('.user-dropdown-menu')) {
    userDropdown.classList.remove('active');
    if (userSection) {
      userSection.classList.remove('active');
    }
  }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const userDropdown = document.getElementById('userDropdownMenu');
    const userSection = document.getElementById('userSection');
    if (userDropdown && userDropdown.classList.contains('active')) {
      userDropdown.classList.remove('active');
      if (userSection) {
        userSection.classList.remove('active');
      }
    }
    const sortMenu = document.getElementById('sortMenu');
    if (sortMenu) {
      sortMenu.classList.add('hidden');
    }
    closeProfile();
  }
});

/* ==================================================
   USER DROPDOWN TOGGLE
================================================== */
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdownMenu');
  const userSection = document.getElementById('userSection');
  
  if (dropdown) {
    const isActive = dropdown.classList.toggle('active');
    
    if (userSection) {
      if (isActive) {
        userSection.classList.add('active');
      } else {
        userSection.classList.remove('active');
      }
    }
    
    console.log('Dropdown toggled:', isActive ? 'OPEN' : 'CLOSED');
  }
}

/* ==================================================
   INITIALIZE APP (FIXED)
================================================== */
document.addEventListener("DOMContentLoaded", () => {

  // ---- Profile preload (safe) ----
  const profile = JSON.parse(localStorage.getItem("profileData") || "{}");
  if (profile.fullName) {
    if (window.fullName) fullName.value = profile.fullName || "";
    if (window.nickName) nickName.value = profile.nickName || "";
    if (window.gender) gender.value = profile.gender || "";
    if (window.country) country.value = profile.country || "";
    if (window.language) language.value = profile.language || "";
    if (window.timeZone) timeZone.value = profile.timeZone || "";

    if (window.profileName) profileName.textContent = profile.fullName;
    if (window.profileAvatar) profileAvatar.textContent = profile.fullName.charAt(0).toUpperCase();
    if (window.profileEmail) profileEmail.textContent = profile.email || "user@email.com";
  }

  // ---- Logout ----
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      logout();
    });
  }

  // ---- File input ----
  const fileInput = document.getElementById('fileInput');
  const fileLabel = document.getElementById('fileLabel');

  if (fileInput && fileLabel) {
    fileLabel.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', updateFileLabel);
  }

  // ---- Upload button (SINGLE handler) ----
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.style.opacity = '0.5';

    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      upload();
    });
  }

  // ---- Backup status ----
  setInterval(updateBackupStatus, 60000);

  // ---- Auth (LAST) ----
  checkAuth();
  function deleteFromDocuments(id) {
    let documents = JSON.parse(localStorage.getItem("documents")) || [];
    let trash = JSON.parse(localStorage.getItem("myCloudTrash")) || [];

    const index = documents.findIndex(f => f.id === id);
    if (index === -1) return;

    // Move to Trash array
    const fileToTrash = documents[index];
    fileToTrash.deletedAt = new Date().toISOString().split("T")[0];
    trash.push(fileToTrash);

    // Remove from Documents array
    documents.splice(index, 1);

    // Save both
    localStorage.setItem("documents", JSON.stringify(documents));
    localStorage.setItem("myCloudTrash", JSON.stringify(trash));

    alert("Moved to Trash");
    renderRecentDocuments(); // Refresh dashboard list
}
});
