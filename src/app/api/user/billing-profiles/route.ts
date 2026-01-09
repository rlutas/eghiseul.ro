import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/billing-profiles
 * List all billing profiles for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('billing_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Billing profiles fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch billing profiles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.map((item: {
        id: string;
        type: string;
        label: string;
        billing_data: Record<string, unknown>;
        is_default: boolean;
        created_at: string;
        updated_at: string;
      }) => ({
        id: item.id,
        type: item.type,
        label: item.label,
        ...item.billing_data,
        isDefault: item.is_default,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
    });
  } catch (error) {
    console.error('Billing profiles fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/billing-profiles
 * Create a new billing profile
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, label, isDefault, ...billingData } = body;

    // Validate type
    if (!type || !['persoana_fizica', 'persoana_juridica'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid billing type' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('billing_profiles')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    // Insert new billing profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('billing_profiles')
      .insert({
        user_id: user.id,
        type,
        label: label || (type === 'persoana_fizica' ? 'Profil personal' : 'Profil firmă'),
        billing_data: billingData,
        is_default: isDefault || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Billing profile create error:', error);
      return NextResponse.json(
        { error: 'Failed to create billing profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        type: data.type,
        label: data.label,
        ...data.billing_data,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Billing profile create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
