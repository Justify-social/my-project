# Mux Video Upload Troubleshooting Guide

This document provides a comprehensive guide for troubleshooting Mux video upload issues and maintaining the upload system.

## 🚨 **Common Issues & Fixes**

### **Issue 1: CORS Errors - "Server responded with 0"**

**Symptoms:**

- UpChunk upload fails with "Server responded with 0. Stopping upload."
- Video uploads get stuck in "AWAITING_UPLOAD" status
- Browser console shows CORS errors

**Root Cause:**
Port mismatch between frontend requests and server running port.

**Fix Applied:**
✅ **Dynamic CORS Origin Detection** in `src/app/api/mux/create-video-upload/route.ts`:

```typescript
// Use provided CORS origin or fallback to dynamically detected origin
let effectiveCorsOrigin = corsOrigin;

if (!effectiveCorsOrigin) {
  if (process.env.NODE_ENV === 'development') {
    // Dynamically detect the origin from the request
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    effectiveCorsOrigin = `${protocol}://${host}`;
  } else {
    effectiveCorsOrigin = '*';
  }
}
```

### **Issue 2: Asset Management Race Conditions**

**Symptoms:**

- Database errors: "No record was found for an update"
- Assets being deleted while being updated
- Conflicting state between form and database

**Root Cause:**
Multiple code paths trying to update CreativeAsset records simultaneously.

**Fix Applied:**
✅ **Simplified Asset Management** in `src/app/api/campaigns/[campaignId]/wizard/[step]/route.ts`:

- Removed direct CreativeAsset updates from wizard handler
- Assets managed only through dedicated APIs (`/api/creative-assets/[id]`)
- Wizard only manages the JSON `assets` field

### **Issue 3: Complex State Synchronization**

**Symptoms:**

- UI flickering and infinite re-renders
- Form state conflicts with server state
- Assets appearing/disappearing unexpectedly

**Root Cause:**
Overly complex sync logic between multiple state sources.

**Fix Applied:**
✅ **Single Source of Truth (SSOT)** pattern:

- CreativeAsset table: Database records with Mux metadata
- CampaignWizard.assets: Form state and user input
- Frontend form: Temporary state during editing

## 🛡️ **Best Practices**

### **1. Asset Lifecycle Management**

```typescript
// ✅ CORRECT: Simple, predictable flow
1. User uploads → POST /api/mux/create-video-upload
2. Mux processes → Webhook updates CreativeAsset
3. User saves form → PATCH /api/campaigns/[id]/wizard/4 (JSON only)
4. User deletes → DELETE /api/creative-assets/[id]

// ❌ INCORRECT: Multiple update paths
- Don't update CreativeAsset from wizard handler
- Don't sync complex state in useEffect loops
- Don't mix temporary IDs with database IDs
```

### **2. Error Handling Pattern**

```typescript
// ✅ CORRECT: Graceful degradation
try {
  const response = await uploadToMux(file);
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
} catch (error) {
  logger.error('Upload failed:', error);
  setErrorState('Upload failed. Please try again.');
  // Don't crash the entire form
}
```

### **3. CORS Configuration**

```typescript
// ✅ CORRECT: Dynamic detection
const corsOrigin = req.headers.get('origin') || `${protocol}://${req.headers.get('host')}`;

// ❌ INCORRECT: Hardcoded values
const corsOrigin = 'http://localhost:3000'; // Breaks in different environments
```

## 🧪 **Testing Procedures**

### **Upload Flow Test**

1. Start dev server: `npm run dev`
2. Navigate to Step 4 of campaign wizard
3. Upload a video file
4. Verify:
   - UpChunk starts successfully (no CORS errors)
   - CreativeAsset record created in database
   - Mux webhook updates processing status
   - Form state reflects upload progress

### **Error Recovery Test**

1. Upload a file
2. Cancel/interrupt the upload
3. Try uploading again
4. Verify:
   - No orphaned database records
   - Form resets to clean state
   - Error messages are user-friendly

## 📊 **Monitoring & Debugging**

### **Key Logs to Monitor**

```typescript
// CORS issues
'[API /mux/create-video-upload] Using CORS origin: ...';

// Asset management
'[WIZARD PATCH API] Mapping creativeAssets for response.';

// Upload progress
'UpChunk upload progress: X%';
'Upload completed successfully';
```

### **Database Queries to Check**

```sql
-- Check for stuck uploads
SELECT * FROM "CreativeAsset"
WHERE "muxProcessingStatus" = 'AWAITING_UPLOAD'
AND "createdAt" < NOW() - INTERVAL '10 minutes';

-- Check for orphaned assets
SELECT * FROM "CreativeAsset"
WHERE "campaignWizardId" IS NULL;
```

## 🔧 **Recovery Procedures**

### **For Stuck Uploads**

1. Use debug endpoint: `GET /api/debug/verify-mux-playback-ids?action=checkMuxUpload&assetId=X`
2. Check Mux dashboard for upload status
3. If needed, delete and retry upload

### **For Corrupted State**

1. Clear browser cache/localStorage
2. Restart development server
3. Check database for inconsistent records

## 🚀 **Performance Optimizations**

### **Implemented**

- ✅ Dynamic CORS origin detection
- ✅ Simplified asset update logic
- ✅ Background Algolia indexing
- ✅ Proper error boundaries

### **Future Improvements**

- [ ] Upload resume capability
- [ ] Batch upload processing
- [ ] Client-side upload progress persistence
- [ ] Automatic retry on failure

## 📝 **Code Maintenance**

### **Files to Monitor**

- `src/app/api/mux/create-video-upload/route.ts` - Upload URL creation
- `src/app/api/webhooks/mux/route.ts` - Status updates
- `src/components/ui/video-file-uploader.tsx` - Upload UI
- `src/app/api/campaigns/[campaignId]/wizard/[step]/route.ts` - Wizard state

### **Anti-Patterns to Avoid**

- ❌ Hardcoding localhost URLs
- ❌ Complex state sync in components
- ❌ Multiple update paths for same data
- ❌ Mixing temporary and permanent IDs
- ❌ Ignoring upload errors

---

**Last Updated:** 2025-05-27  
**Version:** 2.0  
**Status:** ✅ Issues Resolved
