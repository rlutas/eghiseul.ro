# AWS S3 Setup Guide - eGhiseul.ro

**Last Updated:** 2026-01-09
**Region:** eu-central-1 (Frankfurt)
**Bucket:** eghiseul-documents

---

## Overview

This guide covers the complete AWS S3 setup for eGhiseul.ro document storage:
- KYC documents (ID scans, selfies)
- Order documents (uploaded files)
- Generated contracts and agreements
- Final documents delivered to customers
- System templates

---

## Step 1: Create S3 Bucket

### Via AWS Console

1. Go to **S3** in AWS Console
2. Click **Create bucket**
3. Configure:
   ```
   Bucket name: eghiseul-documents
   AWS Region: EU (Frankfurt) eu-central-1

   Object Ownership: ACLs disabled (recommended)

   Block Public Access settings:
   ✅ Block all public access (KEEP THIS ON!)

   Bucket Versioning: Enable (recommended for compliance)

   Default encryption:
   - Server-side encryption: Enable
   - Encryption type: Amazon S3 managed keys (SSE-S3)
   - Bucket Key: Enable

   Tags:
   - Environment: production
   - Project: eghiseul
   - DataClassification: confidential
   ```
4. Click **Create bucket**

### Via AWS CLI

```bash
# Create bucket
aws s3api create-bucket \
  --bucket eghiseul-documents \
  --region eu-central-1 \
  --create-bucket-configuration LocationConstraint=eu-central-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket eghiseul-documents \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket eghiseul-documents \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket eghiseul-documents \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'
```

---

## Step 2: Create IAM User for Application

### Via AWS Console

1. Go to **IAM** > **Users** > **Create user**
2. Configure:
   ```
   User name: eghiseul-app

   ❌ Provide user access to the AWS Management Console (uncheck)
   ```
3. Click **Next**
4. Select **Attach policies directly**
5. Click **Create policy** (new tab)

### Create Custom Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3DocumentsBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObjectVersion",
        "s3:DeleteObjectVersion"
      ],
      "Resource": [
        "arn:aws:s3:::eghiseul-documents",
        "arn:aws:s3:::eghiseul-documents/*"
      ]
    },
    {
      "Sid": "S3PresignedURLs",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::eghiseul-documents/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

Save policy as: `eghiseul-s3-documents-policy`

6. Attach the policy to the user
7. Click **Create user**
8. Go to user > **Security credentials** > **Create access key**
9. Select **Application running outside AWS**
10. Save the credentials:
    ```
    Access key ID: AKIA...
    Secret access key: ...
    ```

---

## Step 3: Configure Bucket CORS

Required for browser-based uploads using presigned URLs.

### Via AWS Console

1. Go to S3 bucket > **Permissions** > **Cross-origin resource sharing (CORS)**
2. Add configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://eghiseul.ro",
      "https://www.eghiseul.ro",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag", "x-amz-meta-*"],
    "MaxAgeSeconds": 3600
  }
]
```

### Via AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket eghiseul-documents \
  --cors-configuration file://cors.json
```

---

## Step 4: Configure Lifecycle Rules

Automatically manage document retention and cleanup.

### Via AWS Console

1. Go to S3 bucket > **Management** > **Create lifecycle rule**

### Rule 1: Temporary Uploads Cleanup

```
Rule name: cleanup-temp-uploads
Rule scope: Limit to prefix: temp/

Lifecycle rule actions:
✅ Expire current versions of objects
   - Days after object creation: 1

✅ Permanently delete noncurrent versions
   - Days after objects become noncurrent: 1
```

### Rule 2: KYC Document Retention (90 days active, then archive)

```
Rule name: kyc-lifecycle
Rule scope: Limit to prefix: kyc/

Lifecycle rule actions:
✅ Transition current versions of objects
   - Standard-IA: 90 days
   - Glacier Instant Retrieval: 365 days

✅ Expire current versions of objects
   - Days: 2555 (7 years - legal requirement)
```

### Rule 3: Contracts Retention (10 years)

```
Rule name: contracts-lifecycle
Rule scope: Limit to prefix: contracts/

Lifecycle rule actions:
✅ Transition current versions of objects
   - Standard-IA: 30 days
   - Glacier Instant Retrieval: 365 days

✅ Expire current versions of objects
   - Days: 3650 (10 years)
```

---

## Step 5: Environment Variables

Add to `.env.local`:

```env
# AWS S3 Configuration
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=AKIA...your-access-key...
AWS_SECRET_ACCESS_KEY=...your-secret-key...
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents
```

For production (Vercel):
1. Go to Project Settings > Environment Variables
2. Add all four variables
3. Set scope to Production (and Preview if needed)

---

## Step 6: Verify Setup

### Test Connection

```bash
# Run from project root
npx ts-node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

client.send(new ListBucketsCommand({}))
  .then(r => console.log('✅ Connected! Buckets:', r.Buckets.map(b => b.Name)))
  .catch(e => console.error('❌ Error:', e.message));
"
```

### Test Upload

```bash
# Create test file
echo "test" > /tmp/test.txt

# Upload
aws s3 cp /tmp/test.txt s3://eghiseul-documents/temp/test.txt

# Verify
aws s3 ls s3://eghiseul-documents/temp/

# Cleanup
aws s3 rm s3://eghiseul-documents/temp/test.txt
```

---

## Folder Structure

```
eghiseul-documents/
├── kyc/                          # KYC verification documents
│   └── {user_id}/
│       └── {verification_id}/
│           ├── ci_front.jpg      # ID card front
│           ├── ci_back.jpg       # ID card back (optional)
│           ├── selfie.jpg        # Selfie with ID
│           └── metadata.json     # OCR results, validation data
│
├── orders/                       # Order-related documents
│   └── {year}/
│       └── {month}/
│           └── {order_id}/
│               ├── uploads/      # Customer uploaded files
│               │   └── {filename}
│               ├── signature.png # Electronic signature
│               └── metadata.json
│
├── contracts/                    # Generated contracts
│   └── {year}/
│       └── {month}/
│           └── {contract_number}/
│               ├── contract.pdf
│               ├── contract_signed.pdf
│               └── metadata.json
│
├── invoices/                     # Generated invoices
│   └── {year}/
│       └── {month}/
│           └── {invoice_number}.pdf
│
├── final-documents/              # Delivered documents
│   └── {year}/
│       └── {month}/
│           └── {order_id}/
│               ├── cazier_fiscal.pdf
│               ├── extras_cf.pdf
│               └── metadata.json
│
├── templates/                    # Document templates
│   ├── contracts/
│   │   ├── contract_pf_v1.docx
│   │   └── contract_pj_v1.docx
│   ├── emails/
│   └── invoices/
│
└── temp/                         # Temporary files (auto-deleted after 24h)
    └── {upload_id}/
```

---

## Security Best Practices

### 1. Never Expose S3 URLs Directly

Always use presigned URLs with short expiration:

```typescript
// Good - 15 minute expiry for viewing
const url = await getDownloadUrl(key, 900);

// Bad - long expiry
const url = await getDownloadUrl(key, 86400);
```

### 2. Validate File Types

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(contentType)) {
  throw new Error('Invalid file type');
}
```

### 3. Use Server-Side Encryption

Always include encryption header:

```typescript
const command = new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  ServerSideEncryption: 'AES256',
});
```

### 4. Audit Access

Enable S3 access logging:

```bash
aws s3api put-bucket-logging \
  --bucket eghiseul-documents \
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "eghiseul-logs",
      "TargetPrefix": "s3-access-logs/"
    }
  }'
```

---

## Troubleshooting

### Access Denied

1. Check IAM policy is attached to user
2. Verify bucket name in policy matches actual bucket
3. Check AWS credentials in .env.local

### CORS Errors

1. Verify CORS configuration on bucket
2. Check AllowedOrigins includes your domain
3. Clear browser cache and retry

### Presigned URL Expired

- Default is 1 hour, increase if needed
- For uploads, 5-15 minutes is usually enough

### Large File Uploads Failing

- Use multipart upload for files > 100MB
- Increase Lambda/Vercel timeout if using serverless

---

## Related Documentation

- [AWS S3 Developer Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/)
- [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

---

**Next Steps:**
1. Create bucket following steps above
2. Add credentials to .env.local
3. Test connection using verification script
4. Start using upload APIs
