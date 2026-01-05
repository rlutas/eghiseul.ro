import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/cleanup - Run cleanup of expired draft orders
 *
 * This endpoint triggers anonymization of draft orders older than 7 days.
 * For GDPR compliance, personal data is removed but order metadata is kept.
 *
 * Can be called:
 * - Manually by admin
 * - By a cron job (e.g., daily at 2 AM)
 * - By Vercel/Supabase scheduled functions
 *
 * Headers:
 * - x-cron-secret: For automated calls (optional, for added security)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Optional: Verify cron secret for automated calls
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it for automated calls
    if (expectedSecret && cronSecret !== expectedSecret) {
      // If no cron secret, check for admin user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          },
          { status: 401 }
        );
      }

      // TODO: Check if user is admin when roles are implemented
    }

    // Run the anonymization function
    // Note: This function may not exist in types if migration hasn't been run
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('anonymize_expired_drafts');

    if (error) {
      // If function doesn't exist, migration hasn't been applied
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MIGRATION_REQUIRED',
              message: 'Please run migration 009_draft_auto_cleanup.sql',
            },
          },
          { status: 500 }
        );
      }

      console.error('Cleanup error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLEANUP_FAILED',
            message: 'Failed to run cleanup',
          },
        },
        { status: 500 }
      );
    }

    // Extract results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (data as any)?.[0] || { anonymized_count: 0, order_ids: [] };

    // Log the cleanup action
    try {
      await supabase.from('audit_logs').insert({
        action: 'draft_cleanup',
        status: 'success',
        ip_address: request.headers.get('x-forwarded-for') || 'system',
        resource_type: 'orders',
        metadata: {
          anonymized_count: result.anonymized_count,
          order_ids: result.order_ids,
          triggered_by: cronSecret ? 'cron' : 'manual',
        },
      });
    } catch {
      // Audit log failure shouldn't fail the cleanup
      console.warn('Failed to log cleanup action');
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully anonymized ${result.anonymized_count} expired draft orders`,
        anonymized_count: result.anonymized_count,
        order_ids: result.order_ids,
        retention_policy: {
          days: 7,
          description: 'Draft orders older than 7 days are anonymized',
        },
      },
    });
  } catch (error) {
    console.error('Unexpected cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup - Get cleanup status and pending drafts
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Count pending expired drafts
    const { data: pendingDrafts, error: pendingError } = await supabase
      .from('orders')
      .select('id, friendly_order_id, created_at', { count: 'exact' })
      .eq('status', 'draft')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (pendingError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUERY_FAILED',
            message: 'Failed to get pending drafts',
          },
        },
        { status: 500 }
      );
    }

    // Count recently anonymized
    const { count: recentlyAnonymized } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'expired_anonymized')
      .gte('anonymized_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Get total drafts
    const { count: totalDrafts } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    return NextResponse.json({
      success: true,
      data: {
        pending_cleanup: {
          count: pendingDrafts?.length || 0,
          orders: pendingDrafts?.map((d) => ({
            id: d.friendly_order_id,
            created_at: d.created_at,
            days_old: d.created_at
              ? Math.floor((Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0,
          })),
        },
        stats: {
          total_drafts: totalDrafts || 0,
          anonymized_last_24h: recentlyAnonymized || 0,
        },
        retention_policy: {
          days: 7,
          description: 'Draft orders older than 7 days are anonymized for GDPR compliance',
          next_cleanup: 'Run POST /api/admin/cleanup to execute',
        },
      },
    });
  } catch (error) {
    console.error('Cleanup status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
