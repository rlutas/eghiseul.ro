/**
 * Configure S3 CORS for eghiseul-documents bucket
 * Run with: npx tsx scripts/configure-s3-cors.ts
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (err) {
    console.error('Could not load .env.local:', err);
  }
}

loadEnv();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_DOCUMENTS || 'eghiseul-documents';

const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://eghiseul.ro',
        'https://www.eghiseul.ro',
        'https://*.vercel.app',
      ],
      ExposeHeaders: ['ETag', 'x-amz-meta-user-id', 'x-amz-meta-original-filename', 'x-amz-meta-uploaded-at'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function configureCors() {
  console.log('Configuring CORS for bucket:', BUCKET);
  console.log('Region:', process.env.AWS_REGION);
  console.log('');

  try {
    // First, check current CORS config
    console.log('Checking current CORS configuration...');
    try {
      const currentCors = await s3Client.send(new GetBucketCorsCommand({ Bucket: BUCKET }));
      console.log('Current CORS config:', JSON.stringify(currentCors.CORSRules, null, 2));
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('No CORS configuration found. Setting up...');
      } else {
        throw err;
      }
    }

    // Apply new CORS config
    console.log('\nApplying new CORS configuration...');
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET,
      CORSConfiguration: corsConfig,
    }));

    console.log('CORS configuration applied successfully!');
    console.log('\nNew CORS config:', JSON.stringify(corsConfig.CORSRules, null, 2));

    // Verify
    console.log('\nVerifying...');
    const verifyResult = await s3Client.send(new GetBucketCorsCommand({ Bucket: BUCKET }));
    console.log('Verified CORS config:', JSON.stringify(verifyResult.CORSRules, null, 2));

    console.log('\n✅ CORS configuration complete!');
  } catch (error) {
    console.error('❌ Error configuring CORS:', error);
    process.exit(1);
  }
}

configureCors();
