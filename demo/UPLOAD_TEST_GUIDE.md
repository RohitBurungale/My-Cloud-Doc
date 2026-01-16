# Upload Function Test Guide

## ✅ Fixed Issues

1. **ID Mismatch**: Changed `uploadLabel` to `fileLabel` in home.html (line 833)
2. **Upload Function**: Refactored with proper error handling and progress tracking
3. **Session Verification**: Added `await account.get()` before upload
4. **Progress Animation**: Smooth progress bar with 0% → 95% → 100%
5. **Console Logging**: Minimized debug logs, kept only critical errors

## 📋 Test Scenarios

### Test 1: Single File Upload
**Steps:**
1. Click "Upload Document" button
2. Select ONE file (any size < 50MB)
3. Click "Upload Files" button
4. Observe progress bar
5. Check console for: `📤 Uploading: [filename]` → `✅ [filename] uploaded`

**Expected:**
- ✅ Progress bar appears
- ✅ Shows "Uploading 1/1: filename"
- ✅ Smooth progress animation (0% → 95% → 100%)
- ✅ Toast shows: "✅ [filename] uploaded"
- ✅ File appears in "My Documents" list
- ✅ Console shows clean logs

### Test 2: Multiple Files Upload
**Steps:**
1. Click "Upload Document" button
2. Select MULTIPLE files (hold Ctrl/Cmd while clicking)
3. Should show "3 file(s) selected" (or whatever number)
4. Click "Upload Files" button
5. Watch progress bar update for each file

**Expected:**
- ✅ Label shows "3 file(s) selected" (count matches)
- ✅ Upload button enabled (no longer disabled)
- ✅ Progress bar shows: "Uploading 1/3", "Uploading 2/3", "Uploading 3/3"
- ✅ Each file shows "✅" when complete
- ✅ Final toast: "✅ All 3 files uploaded"
- ✅ All files appear in list

### Test 3: Progress Animation
**Steps:**
1. Upload a file
2. Watch the progress bar

**Expected:**
- ✅ Progress bar visible
- ✅ Smooth animation (not jumpy)
- ✅ Goes from 0% → ~95% during upload
- ✅ Jumps to 95% when storage completes
- ✅ Reaches 100% when database saves
- ✅ Text updates: "Uploading filename" → "✅ filename"

### Test 4: Large File Upload (Close to 50MB)
**Steps:**
1. Create a large test file (~45MB)
2. Upload it
3. Monitor the upload

**Expected:**
- ✅ Upload takes time but completes
- ✅ Progress animation continues smoothly
- ✅ Toast shows success message
- ✅ File appears in list with correct size

### Test 5: File Too Large (>50MB)
**Steps:**
1. Attempt to upload a file > 50MB
2. Click upload button

**Expected:**
- ✅ Toast shows: "❌ filename: File too large. Maximum size is 50MB"
- ✅ File NOT uploaded
- ✅ Upload continues for other files (if multiple)

### Test 6: Session Expiration During Upload
**Steps:**
1. Start upload
2. Manually log out in another tab (or wait for session to expire)
3. Upload should have already verified session at start

**Expected:**
- ✅ If session expires BEFORE upload: Toast "Session expired. Please login again"
- ✅ Redirect to login page after 1.5 seconds
- ✅ No partial files uploaded

### Test 7: Connection Error
**Steps:**
1. Upload a file
2. Disconnect internet during upload (turn off WiFi)
3. Watch for error

**Expected:**
- ✅ Toast shows: "❌ filename: Connection error"
- ✅ File NOT fully uploaded
- ✅ Progress bar stops

### Test 8: No Files Selected
**Steps:**
1. DON'T select any file
2. Click "Upload Files" button directly

**Expected:**
- ✅ Toast shows: "Please select a file"
- ✅ Upload doesn't start
- ✅ No network request made

### Test 9: Upload Button Reset
**Steps:**
1. Upload a file
2. Wait for completion
3. Look at upload button

**Expected:**
- ✅ Button text changes back to "⬆️ Upload Files"
- ✅ Button is DISABLED (grayed out) until new files selected
- ✅ Upload label shows "Choose File(s)"

### Test 10: Console Logging - Clean Output
**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Upload a file
4. Check console output

**Expected:**
- ✅ Shows: `📤 Uploading: filename.ext`
- ✅ Shows: `Reloading files and storage...`
- ✅ Shows: `✅ File uploaded successfully` (for single file)
- ✅ NO excessive debug logs
- ✅ Errors only show if they occur

## 🔧 Troubleshooting

### Button Not Responding
- Check: Is the button showing "disabled" style (grayed out)?
- Fix: Open console (F12), run `upload()` manually to see errors
- Check: Is fileInput element present? Run: `document.getElementById('fileInput')`

### Progress Bar Not Showing
- Check: Does progressBox element exist? Run: `document.getElementById('progressBox')`
- Fix: Ensure display property is set to 'block'
- Check browser console for: `Progress elements not found`

### Files Not Appearing in List
- Check: Did upload actually complete (100% progress)?
- Check: Are files showing in Appwrite console?
- Run: `loadFiles()` manually in console to reload list

### Session Error on Upload
- Fix: Try uploading immediately after login (fresh session)
- Check: Clear browser cache and try again
- Verify: Login page works correctly

## 📊 Expected Console Output - Successful Upload

```
📤 Uploading: document.pdf
Reloading files and storage...
✅ File uploaded successfully
```

## ❌ Expected Console Output - Failed Upload

```
📤 Uploading: video.mp4
Upload error: File too large. Maximum size is 50MB
```

## 🎯 Diagnostic Commands

Run these in the browser console (F12 → Console):

```javascript
// Check element existence
document.getElementById('fileInput')        // Should return <input> element
document.getElementById('uploadBtn')        // Should return <button> element
document.getElementById('fileLabel')        // Should return <label> element
document.getElementById('progressBox')      // Should return <div> element

// Check configuration
window.APPWRITE_CONFIG              // Should show endpoint and project
window.APPWRITE_CONFIG.endpoint     // Should be the Appwrite URL
window.APPWRITE_CONFIG.project      // Should be the project ID

// Test upload function manually
upload()                            // Will upload selected files

// Check current user
userId                              // Should show user ID
account.get()                       // Should return user info (if logged in)

// Reload files manually
loadFiles()                         // Reloads file list
```

## ✨ Success Criteria

All 10 test scenarios pass if:
- ✅ Upload responds to button clicks
- ✅ Progress bar appears and animates smoothly
- ✅ Files appear in the list after upload
- ✅ Console shows clean logs (no excessive debug output)
- ✅ Error scenarios show appropriate error messages
- ✅ Session verification works
- ✅ UI resets properly after upload completes
- ✅ Upload button re-enables for new files
- ✅ Multiple files upload correctly
- ✅ File size validation works

---

## Quick Start: Copy-Paste Test

**For Single File Upload:**
```javascript
// In browser console (F12):
document.getElementById('fileInput').click()  // Opens file picker
// Select ONE file, then:
upload()  // Manually trigger upload
```

**For Diagnostic Info:**
```javascript
// Run this to see all status info
console.log({
  fileInput: !!document.getElementById('fileInput'),
  uploadBtn: !!document.getElementById('uploadBtn'),
  fileLabel: !!document.getElementById('fileLabel'),
  progressBox: !!document.getElementById('progressBox'),
  userId: userId,
  config: window.APPWRITE_CONFIG
})
```

