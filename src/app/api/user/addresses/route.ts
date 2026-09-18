import { NextResponse } from 'next/server';
import { findSameAddress } from '@/lib/account/same-address';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/addresses
 * List all saved addresses for the current user
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
      .from('user_saved_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('data_type', 'address')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Addresses fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.map((item: {
        id: string;
        label: string;
        data: Record<string, unknown>;
        is_default: boolean;
        created_at: string;
        updated_at: string;
      }) => ({
        id: item.id,
        label: item.label,
        ...item.data,
        isDefault: item.is_default,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
    });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/addresses
 * Create a new address
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
    const { label, isDefault, ...addressData } = body;

    // The same place saved twice — by the scan in „Date personale" and by
    // the document save, or typed once more — used to become two rows, both
    // „Adresă din act". Now the existing row is returned (and made default
    // when asked), so every caller is idempotent without knowing it.
    type SavedRow = { id: string; label: string; data: Record<string, unknown>; is_default: boolean; created_at: string; updated_at: string };
    let existingRows: SavedRow[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('user_saved_data')
        .select('id, label, data, is_default, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('data_type', 'address');
      existingRows = (data ?? []) as SavedRow[];
    } catch (lookupError) {
      // A failed lookup must not block saving; worst case is the old duplicate.
      console.error('Address dedupe lookup failed:', lookupError);
    }
    const duplicate = findSameAddress(existingRows, addressData);
    if (duplicate) {
      if (isDefault && !duplicate.is_default) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('user_saved_data').update({ is_default: false }).eq('user_id', user.id).eq('data_type', 'address');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('user_saved_data').update({ is_default: true }).eq('id', duplicate.id);
      }
      return NextResponse.json({
        success: true,
        data: {
          id: duplicate.id,
          label: duplicate.label,
          ...duplicate.data,
          isDefault: isDefault ? true : duplicate.is_default,
          createdAt: duplicate.created_at,
          updatedAt: duplicate.updated_at,
        },
        deduplicated: true,
      });
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('user_saved_data')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('data_type', 'address');
    }

    // Insert new address
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('user_saved_data')
      .insert({
        user_id: user.id,
        data_type: 'address',
        label: label || 'Adresă nouă',
        data: addressData,
        is_default: isDefault || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Address create error:', error);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        label: data.label,
        ...data.data,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Address create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
