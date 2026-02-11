# S3 403 Forbidden Error Fix

**Date:** 2026-01-09
**Status:** Resolved
**Severity:** Critical (blocked all document uploads)

---

## Problem Description

When users attempted to upload KYC documents (ID scans, selfies), the upload failed with a `403 Forbidden` error from AWS S3. The browser console showed:

```
S3 upload failed, using data URL: Error: S3 upload failed: Forbidden
```

Documents were falling back to base64 data URLs stored in the database instead of S3.

---

## Investigation Steps

### Step 1: Verify CORS Configuration

First checked if CORS was properly configured on the S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://eghiseul.ro",
      "https://www.eghiseul.ro",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag", "x-amz-meta-user-id", "x-amz-meta-original-filename", "x-amz-meta-uploaded-at"],
    "MaxAgeSeconds": 3600
  }
]
```

**Result:** CORS was correctly configured. Not the issue.

### Step 2: Check Encryption Headers

Investigated whether the `ServerSideEncryption` header was causing issues:

**File: `src/lib/aws/upload-client.ts`**
```typescript
// Added encryption header to match presigned URL
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type,
    'x-amz-server-side-encryption': 'AES256',  // Added
  },
  body: file,
});
```

**Result:** Still got 403 Forbidden. The header addition didn't help.

### Step 3: Investigate Presigned URL Generation

Checked `src/lib/aws/s3.ts` for presigned URL generation:

```typescript
const command = new PutObjectCommand({
  Bucket: BUCKET,
  Key: key,
  ContentType: contentType,
  ServerSideEncryption: 'AES256',  // This was the problem!
  Metadata: metadata,
});
```

**Result:** The `ServerSideEncryption` parameter in the presigned URL was causing a signature mismatch.

### Step 4: Check IAM Policies

Discovered the real issue - the IAM user `eghiseul-app` had **NO policies attached**.

```
IAM > Users > eghiseul-app > Permissions
Policies: (none)
```

---

## Root Cause

**Two issues identified:**

1. **Primary:** The IAM user `eghiseul-app` had no policies attached, so it had no permissions to upload to S3.

2. **Secondary:** When using presigned URLs with bucket default encryption (SSE-S3), including `ServerSideEncryption` in the `PutObjectCommand` causes signature mismatch errors because the client doesn't send the same header.

---

## Solution Applied

### Fix 1: Attach IAM Policy

In AWS Console:
1. Go to IAM > Users > eghiseul-app
2. Click "Add permissions" > "Attach policies directly"
3. Search for and attach `AmazonS3FullAccess`

### Fix 2: Remove ServerSideEncryption from Presigned URLs

**File: `src/lib/aws/s3.ts` (line ~172)**

```typescript
// BEFORE (caused 403)
const command = new PutObjectCommand({
  Bucket: BUCKET,
  Key: key,
  ContentType: contentType,
  ServerSideEncryption: 'AES256',  // REMOVE THIS
  Metadata: metadata,
});

// AFTER (works)
const command = new PutObjectCommand({
  Bucket: BUCKET,
  Key: key,
  ContentType: contentType,
  Metadata: metadata,
  // Note: Don't include ServerSideEncryption here - bucket has SSE-S3 enabled by default
});
```

### Fix 3: Remove Encryption Header from Client

**File: `src/lib/aws/upload-client.ts` (line ~64)**

```typescript
// BEFORE
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type,
    'x-amz-server-side-encryption': 'AES256',  // REMOVE THIS
  },
  body: file,
});

// AFTER
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type,
  },
  body: file,
});
```

---

## Why This Works

1. **Bucket Default Encryption:** The S3 bucket `eghiseul-documents` has SSE-S3 (AES-256) encryption enabled by default. All uploaded objects are automatically encrypted without needing to specify the header.

2. **Presigned URL Signature:** When generating a presigned URL with `ServerSideEncryption`, the signature includes that parameter. If the client doesn't send the exact same header, the signature doesn't match and AWS returns 403 Forbidden.

3. **IAM Policy:** Without `s3:PutObject` permission, even a valid presigned URL will fail because the IAM user generating it lacks the permission being delegated.

---

## Verification

After applying fixes:

1. **Upload Test:** Uploaded test image via KYC form
2. **Result:** `POST /api/upload 200` followed by `POST /api/ocr/extract 200`
3. **S3 Bucket:** Files appearing in `kyc/{user_id}/{verification_id}/` folder
4. **Encryption:** Objects show "Server-side encryption: Amazon S3 managed keys (SSE-S3)"

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/aws/s3.ts` | Removed `ServerSideEncryption` from `getUploadUrl()` |
| `src/lib/aws/upload-client.ts` | Removed `x-amz-server-side-encryption` header |
| `docs/deployment/AWS_S3_SETUP.md` | Updated IAM policy docs and troubleshooting |
| `docs/security/S3_SECURITY_SUMMARY.md` | Created security assessment |
| `docs/security/S3_SECURITY_ASSESSMENT.md` | Created detailed security audit |

---

## Prevention

To prevent this issue in future deployments:

1. **Always verify IAM policies** are attached after creating IAM users
2. **Test S3 uploads** immediately after setting up a new environment
3. **Don't add encryption headers** when using bucket default encryption
4. **Check CloudWatch logs** for S3 access denied errors

---

## Related Documentation

- `docs/deployment/AWS_S3_SETUP.md` - Complete S3 setup guide
- `docs/security/S3_SECURITY_SUMMARY.md` - Security quick reference
- `docs/security/S3_SECURITY_ASSESSMENT.md` - Full security audit

---

**Resolution Time:** ~2 hours
**Impact:** All KYC document uploads were blocked
**Users Affected:** All users attempting KYC verification
