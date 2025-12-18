import { NextRequest, NextResponse } from 'next/server';
import {
  extractFromDocument,
  extractFromCIFront,
  extractFromCIBack,
  extractFromPassport,
  extractFromCIBothSides,
  DocumentType,
} from '@/lib/services/document-ocr';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { logAudit, getAuditContext, sanitizeMetadata } from '@/lib/security/audit-logger';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for AI processing

/**
 * POST /api/ocr/extract
 *
 * Extracts data from identity documents using Google Gemini AI OCR
 *
 * Security:
 * - Rate limited: 10 req/min (guest), 30 req/min (authenticated)
 * - Origin validation: Must come from our domain
 * - Audit logging: All requests are logged (no PII)
 *
 * Body:
 * - Auto-detect mode:
 *   {
 *     mode: 'auto',
 *     imageBase64: string,
 *     mimeType: string
 *   }
 *
 * - Specific document type:
 *   {
 *     mode: 'specific',
 *     documentType: 'ci_front' | 'ci_back' | 'passport',
 *     imageBase64: string,
 *     mimeType: string
 *   }
 *
 * - Both CI sides:
 *   {
 *     mode: 'ci_complete',
 *     front: { imageBase64: string, mimeType: string },
 *     back: { imageBase64: string, mimeType: string }
 *   }
 */
export async function POST(request: NextRequest) {
  const auditContext = getAuditContext(request);
  const clientIP = getClientIP(request);

  try {
    // =========================================================================
    // SECURITY CHECK 1: Origin validation (prevent external abuse)
    // =========================================================================
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'https://eghiseul.ro',
      'https://www.eghiseul.ro',
    ].filter(Boolean);

    const isValidOrigin = allowedOrigins.some(allowed =>
      origin?.startsWith(allowed as string) || referer?.startsWith(allowed as string)
    );

    // In production, enforce origin check
    if (process.env.NODE_ENV === 'production' && !isValidOrigin) {
      await logAudit({
        action: 'ocr_extract',
        status: 'blocked',
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        metadata: { reason: 'invalid_origin', origin, referer },
      });

      return NextResponse.json(
        { error: 'Forbidden', message: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // =========================================================================
    // SECURITY CHECK 2: Rate limiting
    // =========================================================================
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const rateLimitConfig = user
      ? RATE_LIMITS.ocr.authenticated
      : RATE_LIMITS.ocr.guest;

    const rateLimitKey = user ? `ocr:user:${user.id}` : `ocr:ip:${clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, rateLimitConfig);

    if (!rateLimit.allowed) {
      await logAudit({
        action: 'ocr_extract',
        status: 'blocked',
        userId: user?.id,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        metadata: {
          reason: 'rate_limited',
          resetIn: rateLimit.resetIn,
          isAuthenticated: !!user,
        },
      });

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
          retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    // =========================================================================
    // SECURITY CHECK 3: API key configuration
    // =========================================================================
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: 'OCR service not configured',
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
          message: 'Mode is required (auto, specific, or ci_complete)',
        },
        { status: 400 }
      );
    }

    // Auto-detect mode
    if (body.mode === 'auto') {
      const { imageBase64, mimeType } = body;

      if (!imageBase64 || !mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'imageBase64 and mimeType are required',
          },
          { status: 400 }
        );
      }

      const result = await extractFromDocument(imageBase64, mimeType);

      // Log successful OCR extraction (no PII in metadata!)
      await logAudit({
        action: 'ocr_extract',
        status: 'success',
        userId: user?.id,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        resourceType: 'document',
        metadata: {
          mode: 'auto',
          documentType: result.documentType,
          confidence: result.confidence,
          hasAddress: !!result.extractedData?.address,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ocr: result,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Specific document type mode
    if (body.mode === 'specific') {
      const { documentType, imageBase64, mimeType } = body;

      if (!documentType || !imageBase64 || !mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'documentType, imageBase64, and mimeType are required',
          },
          { status: 400 }
        );
      }

      if (!['ci_front', 'ci_back', 'passport'].includes(documentType)) {
        return NextResponse.json(
          {
            error: 'Invalid document type',
            message: 'documentType must be ci_front, ci_back, or passport',
          },
          { status: 400 }
        );
      }

      let result;
      switch (documentType as DocumentType) {
        case 'ci_front':
          result = await extractFromCIFront(imageBase64, mimeType);
          break;
        case 'ci_back':
          result = await extractFromCIBack(imageBase64, mimeType);
          break;
        case 'passport':
          result = await extractFromPassport(imageBase64, mimeType);
          break;
        default:
          return NextResponse.json(
            {
              error: 'Invalid document type',
              message: 'Unsupported document type',
            },
            { status: 400 }
          );
      }

      // Log successful OCR extraction
      await logAudit({
        action: 'ocr_extract',
        status: 'success',
        userId: user?.id,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        resourceType: 'document',
        metadata: {
          mode: 'specific',
          documentType,
          confidence: result.confidence,
          hasAddress: !!result.extractedData?.address,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ocr: result,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Complete CI (both sides) mode
    if (body.mode === 'ci_complete') {
      const { front, back } = body;

      if (!front?.imageBase64 || !front?.mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'CI front image is required',
          },
          { status: 400 }
        );
      }

      if (!back?.imageBase64 || !back?.mimeType) {
        return NextResponse.json(
          {
            error: 'Invalid request',
            message: 'CI back image is required',
          },
          { status: 400 }
        );
      }

      const result = await extractFromCIBothSides(
        front.imageBase64,
        front.mimeType,
        back.imageBase64,
        back.mimeType
      );

      // Log successful OCR extraction
      await logAudit({
        action: 'ocr_extract',
        status: 'success',
        userId: user?.id,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
        resourceType: 'document',
        metadata: {
          mode: 'ci_complete',
          documentType: 'ci_both_sides',
          confidence: result.confidence,
          hasAddress: !!result.extractedData?.address,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ocr: result,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid mode',
        message: 'Mode must be auto, specific, or ci_complete',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('OCR extraction error:', error);

    // Log failed extraction
    await logAudit({
      action: 'ocr_extract',
      status: 'failed',
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      resourceType: 'document',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

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
 * GET /api/ocr/extract
 *
 * Health check endpoint
 */
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;

  return NextResponse.json({
    status: hasApiKey ? 'ready' : 'not_configured',
    service: 'Document OCR',
    provider: 'Google Gemini 2.0 Flash Exp',
    supportedDocuments: ['ci_front', 'ci_back', 'passport'],
    features: [
      'Auto-detect document type',
      'Extract personal data (CNP, name, birth date, etc.)',
      'Extract address from CI back',
      'Support for Romanian ID cards and passports',
    ],
    timestamp: new Date().toISOString(),
  });
}
