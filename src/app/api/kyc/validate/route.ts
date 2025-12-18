import { NextRequest, NextResponse } from 'next/server';
import {
  validateKYCDocument,
  validateCompleteKYC,
  KYCValidationRequest,
  KYCValidationResult,
} from '@/lib/services/kyc-validation';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for AI processing

/**
 * POST /api/kyc/validate
 *
 * Validates KYC documents using Google Gemini AI
 *
 * Body:
 * - Single document validation:
 *   {
 *     mode: 'single',
 *     documentType: 'ci_front' | 'ci_back' | 'selfie',
 *     imageBase64: string,
 *     mimeType: string,
 *     referenceImageBase64?: string, // For selfie face matching
 *     referenceMimeType?: string
 *   }
 *
 * - Complete KYC validation:
 *   {
 *     mode: 'complete',
 *     ciFront: { imageBase64: string, mimeType: string },
 *     ciBack: { imageBase64: string, mimeType: string },
 *     selfie: { imageBase64: string, mimeType: string }
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: 'KYC validation service not configured',
          message: 'Google AI API key is missing',
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate request
    if (!body.mode) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Mode is required (single or complete)',
        },
        { status: 400 }
      );
    }

    // Single document validation
    if (body.mode === 'single') {
      const { documentType, imageBase64, mimeType, referenceImageBase64, referenceMimeType } = body;

      if (!documentType || !imageBase64 || !mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'documentType, imageBase64, and mimeType are required',
          },
          { status: 400 }
        );
      }

      if (!['ci_front', 'ci_back', 'selfie'].includes(documentType)) {
        return NextResponse.json(
          {
            error: 'Invalid document type',
            message: 'documentType must be ci_front, ci_back, or selfie',
          },
          { status: 400 }
        );
      }

      const validationRequest: KYCValidationRequest = {
        documentType,
        imageBase64,
        mimeType,
        referenceImageBase64,
        referenceMimeType,
      };

      const result = await validateKYCDocument(validationRequest);

      return NextResponse.json({
        success: true,
        data: {
          validation: result,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Complete KYC validation
    if (body.mode === 'complete') {
      const { ciFront, ciBack, selfie } = body;

      if (!ciFront?.imageBase64 || !ciFront?.mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'CI front image is required',
          },
          { status: 400 }
        );
      }

      if (!ciBack?.imageBase64 || !ciBack?.mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'CI back image is required',
          },
          { status: 400 }
        );
      }

      if (!selfie?.imageBase64 || !selfie?.mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'Selfie image is required',
          },
          { status: 400 }
        );
      }

      const result = await validateCompleteKYC(
        ciFront.imageBase64,
        ciFront.mimeType,
        ciBack.imageBase64,
        ciBack.mimeType,
        selfie.imageBase64,
        selfie.mimeType
      );

      return NextResponse.json({
        success: true,
        data: {
          validation: result,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid mode',
        message: 'Mode must be single or complete',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('KYC validation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kyc/validate
 *
 * Health check endpoint
 */
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;

  return NextResponse.json({
    status: hasApiKey ? 'ready' : 'not_configured',
    service: 'KYC Document Validation',
    provider: 'Google Gemini AI',
    supportedDocuments: ['ci_front', 'ci_back', 'selfie'],
    timestamp: new Date().toISOString(),
  });
}
