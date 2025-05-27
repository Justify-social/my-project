# Mux Video Upload Troubleshooting Guide

## 🎯 **STATUS: RESOLVED**

**Issue**: Content Security Policy (CSP) blocking Mux upload and streaming endpoints  
**Root Cause**: Missing Mux domains in Next.js CSP configuration  
**Solution**: Updated `next.config.js` with comprehensive Mux domain allowlist  
**Status**: ✅ **FIXED** - Uploads and playback working perfectly

---

## 📋 **Executive Summary**

Videos were stuck in `AWAITING_UPLOAD` status with UpChunk errors showing "Server responded with 0" because **Content Security Policy was blocking connections to Mux upload endpoints**. The issue was resolved by adding proper Mux domains to the CSP configuration.

**Timeline**:

- ❌ **Before**: CSP blocked uploads → "Server responded with 0"
- ✅ **After**: Full upload/playback flow working → Videos process to `READY` status

---

## 🔍 **Root Cause Analysis**

### **The Problem**

```bash
# Browser Console Error
Refused to connect to 'https://direct-uploads.oci-us-ashburn-1-vop1.production.mux.com/upload/...'
because it violates the following Content Security Policy directive: "connect-src 'self' ..."
```

### **Technical Root Cause**

1. **Upload Flow**: Mux creates upload URLs pointing to cloud storage (Google Cloud/Oracle Cloud)
2. **CSP Violation**: Browser blocks requests to upload domains not in `connect-src` directive
3. **UpChunk Failure**: "Server responded with 0" because request blocked before reaching server
4. **State Stuck**: Videos remain in `AWAITING_UPLOAD` indefinitely

### **Why This Happened**

- **Mux uses multiple cloud providers**: Google Cloud Storage, Oracle Cloud Infrastructure, etc.
- **Dynamic upload URLs**: Different regions/providers have different subdomain patterns
- **CSP too restrictive**: Only allowed `https://stream.mux.com` but not upload endpoints

---

## ✅ **The Solution**

### **Updated CSP Configuration**

File: `next.config.js`

```javascript
// Before (Broken)
"connect-src 'self' ... https://stream.mux.com ...";

// After (Working)
"connect-src 'self' ... https://stream.mux.com https://storage.googleapis.com https://*.mux.com ...";
"media-src 'self' blob: https: https://stream.mux.com https://*.mux.com";
```

### **Mux Domains Added**

- ✅ `https://storage.googleapis.com` - Google Cloud Storage uploads
- ✅ `https://*.mux.com` - All Mux subdomains (covers upload endpoints and streaming)
- ✅ `https://stream.mux.com` - HLS streaming (already present)

### **CSP Directives Updated**

- `connect-src` - For upload requests and HLS playlist requests
- `media-src` - For video streaming content

---

## 🧪 **Verification Steps**

### **Upload Test**

1. Navigate to campaign wizard step 4
2. Upload a video file (any format)
3. **Expected**: No CSP errors, upload progresses to 100%
4. **Expected**: Status changes: `AWAITING_UPLOAD` → `MUX_PROCESSING` → `READY`

### **Playback Test**

1. After upload completes, video preview should appear
2. Click play button
3. **Expected**: Video plays without HLS errors
4. **Expected**: No console errors related to streaming

### **Console Verification**

```bash
# Should see these logs
✅ [INFO] Starting UpChunk upload: {fileName: 'video.mp4'...}
✅ [INFO] UpChunk upload progress: 100%
✅ Status: READY
✅ PlaybackID: [mux-playback-id]

# Should NOT see these errors
❌ Refused to connect to 'https://...' (CSP violation)
❌ UpChunk upload error: Server responded with 0
```

---

## 🏗️ **Architecture & SSOT Principles**

### **Single Source of Truth (SSOT)**

**Asset Management Flow** (Simplified & Working):

```typescript
1. User uploads → POST /api/mux/create-video-upload
2. Mux processes → Webhook updates CreativeAsset table
3. User saves form → PATCH /api/campaigns/[id]/wizard/4 (JSON only)
4. User deletes → DELETE /api/creative-assets/[id]
```

**Data Sources** (Hierarchical):

1. **CreativeAsset Table**: Database records with Mux metadata (primary source)
2. **CampaignWizard.assets**: Form state and user input (secondary)
3. **Frontend Form**: Temporary state during editing (ephemeral)

### **Key Files (SSOT)**

- **CSP Config**: `next.config.js` - Security policy (this file is SSOT for allowed domains)
- **Upload API**: `src/app/api/mux/create-video-upload/route.ts` - Upload URL creation
- **Webhook Handler**: `src/app/api/webhooks/mux/route.ts` - Status updates from Mux
- **Upload Component**: `src/components/ui/video-file-uploader.tsx` - Upload UI

### **Anti-Patterns Avoided**

- ❌ Hardcoding upload domains in multiple files
- ❌ Complex state sync between multiple sources
- ❌ Multiple update paths for same data
- ❌ Mixing temporary and permanent IDs

---

## 📊 **Monitoring & Health Checks**

### **Key Metrics to Monitor**

```sql
-- Check for stuck uploads (investigate if > 0)
SELECT COUNT(*) FROM "CreativeAsset"
WHERE "muxProcessingStatus" = 'AWAITING_UPLOAD'
AND "createdAt" < NOW() - INTERVAL '10 minutes';

-- Check upload success rate (should be > 95%)
SELECT
  COUNT(CASE WHEN "muxProcessingStatus" = 'READY' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM "CreativeAsset"
WHERE "createdAt" > NOW() - INTERVAL '24 hours';
```

### **Alert Conditions**

- Upload failures > 5% in 1 hour window
- Videos stuck in `AWAITING_UPLOAD` > 10 minutes
- CSP violations appearing in error logs

---

## 🚀 **Performance & Optimization**

### **Current Implementation**

- ✅ Dynamic CORS origin detection
- ✅ Chunked upload with retry logic (UpChunk)
- ✅ Background webhook processing
- ✅ Proper error boundaries and user feedback

### **Upload Performance Metrics**

- **Chunk Size**: 5MB (optimal for most connections)
- **Retry Attempts**: 3 per chunk
- **Timeout**: 10 seconds before declaring failure
- **Average Upload Time**: ~2-5 seconds for typical video files

---

## 🔧 **Troubleshooting Playbook**

### **Issue: Upload Stuck in AWAITING_UPLOAD**

```bash
# 1. Check browser console for CSP errors
# 2. Verify CSP includes Mux domains
curl -I http://localhost:3000 | grep -i content-security-policy

# 3. Test upload API directly
curl -X POST "http://localhost:3000/api/mux/create-video-upload" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.mp4","fileType":"video/mp4","campaignWizardId":"UUID","corsOrigin":"http://localhost:3000"}'

# 4. Check Mux webhook logs
tail -f logs/*.log | grep "video.upload"
```

### **Issue: Video Won't Play**

```bash
# 1. Verify asset status is READY
# 2. Check media-src CSP directive includes *.mux.com
# 3. Test playback URL directly
curl -I "https://stream.mux.com/[PLAYBACK_ID].m3u8"
```

### **Recovery Procedures**

1. **Restart dev server** after CSP changes
2. **Hard refresh browser** (`Cmd+Shift+R`) to clear cached policies
3. **Clear Next.js cache** if needed: `rm -rf .next && npm run dev`

---

## 📝 **Change Log**

### **2025-05-27: Complete Resolution**

- ✅ **Root cause identified**: CSP blocking Mux upload endpoints
- ✅ **CSP updated**: Added comprehensive Mux domain support
- ✅ **Upload flow verified**: End-to-end testing completed
- ✅ **Playback flow verified**: Video streaming working
- ✅ **Documentation updated**: This guide established as SSOT
- ✅ **Console cleanup**: Removed invalid CSP patterns

### **Domains Added to CSP**

- `https://storage.googleapis.com` (Google Cloud uploads)
- `https://*.mux.com` (All Mux subdomains for uploads/streaming)

### **Previous Issues Resolved**

- ❌ ~~CORS port mismatch~~ → ✅ Dynamic origin detection
- ❌ ~~Race conditions in asset management~~ → ✅ Simplified SSOT pattern
- ❌ ~~Complex state synchronization~~ → ✅ Clear hierarchy established

---

## 🎯 **Prevention & Best Practices**

### **CSP Management**

1. **Always test CSP changes** with actual upload/playback flows
2. **Use valid wildcard patterns** (`*.domain.com`, not `subdomain-*.domain.com`)
3. **Monitor browser console** for CSP violations in development
4. **Document all allowed domains** with business justification

### **Mux Integration**

1. **Upload domains change over time** - use broad patterns like `*.mux.com`
2. **Always include both upload and streaming** in CSP directives
3. **Test with real files** - some issues only appear with actual uploads
4. **Monitor webhook delivery** - ensure status updates reach your app

### **Code Quality**

1. **Follow SSOT principles** - one authoritative source per data type
2. **Avoid hardcoding URLs** - use environment-aware configuration
3. **Implement proper error handling** - graceful degradation for users
4. **Add comprehensive logging** - aid future troubleshooting

---

**Last Updated**: 2025-05-27  
**Version**: 3.0 (Complete Resolution)  
**Status**: ✅ **PRODUCTION READY**  
**Next Review**: 2025-06-27

---

## 📞 **Support Escalation**

If issues persist after following this guide:

1. **Check recent changes** to `next.config.js` or CSP configuration
2. **Verify Mux service status** at [status.mux.com](https://status.mux.com)
3. **Collect browser network logs** showing blocked requests
4. **Review webhook delivery logs** for processing failures
5. **Contact Mux support** with specific error messages and request IDs

**Remember**: This document is the **Single Source of Truth** for Mux upload troubleshooting. Update here first, then reference elsewhere.
