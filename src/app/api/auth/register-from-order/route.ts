import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * POST /api/auth/register-from-order
 *
 * Creates a new user account from a completed order (guest-to-customer conversion).
 * Migrates order data to the new user's profile.
 *
 * Authentication: None (guest user creating account)
 */

interface RegisterFromOrderRequest {
  orderId: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  saveKycData?: boolean; // Whether to save KYC documents for reuse
}

export async function POST(request: Request) {
  try {
    const body: RegisterFromOrderRequest = await request.json();
    const { orderId, email, password, acceptedTerms, acceptedPrivacy, saveKycData = true } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId', message: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email', message: 'A valid email is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Missing password', message: 'Password is required' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        {
          error: 'Weak password',
          message: 'Parola trebuie să aibă cel puțin 8 caractere',
        },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        {
          error: 'Terms not accepted',
          message: 'Trebuie să accepți Termenii și Condițiile',
        },
        { status: 400 }
      );
    }

    if (!acceptedPrivacy) {
      return NextResponse.json(
        {
          error: 'Privacy not accepted',
          message: 'Trebuie să accepți Politica de Confidențialitate',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Fetch the order to validate it exists and is not linked to a user
    // Use admin client to bypass RLS
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: 'Order not found',
          message: 'Comanda nu a fost găsită',
        },
        { status: 404 }
      );
    }

    // Check if order is already linked to a user
    if (order.user_id) {
      return NextResponse.json(
        {
          error: 'Order already linked',
          message: 'Această comandă este deja asociată unui cont',
        },
        { status: 400 }
      );
    }

    // SECURITY: Validate email MUST match order email
    // This prevents attackers from hijacking orders without email
    const customerData = order.customer_data as Record<string, unknown> | null;
    const orderEmail =
      (customerData?.contact as Record<string, unknown>)?.email ||
      customerData?.email;

    // CRITICAL: Require order to have an email before allowing registration
    if (!orderEmail) {
      return NextResponse.json(
        {
          error: 'Order incomplete',
          message: 'Comanda nu conține date de contact. Te rugăm să completezi comanda mai întâi.',
        },
        { status: 400 }
      );
    }

    // Validate email matches
    if (String(orderEmail).toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Email mismatch',
          message: 'Email-ul trebuie să fie același cu cel folosit la comandă',
        },
        { status: 400 }
      );
    }

    // Extract user metadata from order
    const personal = (customerData?.personal || customerData?.personalKyc || {}) as Record<string, unknown>;
    const firstName = String(personal?.firstName || personal?.first_name || '');
    const lastName = String(personal?.lastName || personal?.last_name || '');

    // Create auth user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          created_from_order: orderId,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/account`,
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);

      // Handle specific errors
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          {
            error: 'Email exists',
            message: 'Un cont cu acest email există deja. Încearcă să te autentifici.',
          },
          { status: 409 }
        );
      }

      if (authError.message.includes('password')) {
        return NextResponse.json(
          {
            error: 'Invalid password',
            message: 'Parola nu respectă cerințele de securitate',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: 'Registration failed',
          message: authError.message || 'Înregistrarea a eșuat',
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error: 'User creation failed',
          message: 'Nu am putut crea contul',
        },
        { status: 500 }
      );
    }

    // Try to migrate order data to profile
    // This might fail if the function doesn't exist yet, so we handle it gracefully
    try {
      // Call the migration function (only accepts 2 parameters: p_order_id, p_user_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: migrateError } = await (adminClient as any).rpc('migrate_order_to_profile', {
        p_order_id: orderId,
        p_user_id: authData.user.id,
      });

      if (migrateError) {
        console.error('Migration error (non-critical):', migrateError);
        // At minimum, link the order to the user (use admin client to bypass RLS)
        await adminClient
          .from('orders')
          .update({ user_id: authData.user.id })
          .eq('id', orderId);
      }
    } catch (migrationError) {
      console.error('Migration function error:', migrationError);
      // Function might not exist yet, link order manually (use admin client)
      await adminClient
        .from('orders')
        .update({ user_id: authData.user.id })
        .eq('id', orderId);
    }

    // Manually save KYC documents if requested
    if (saveKycData) {
      try {
        // Extract KYC data from order
        const personalData = customerData?.personal as Record<string, unknown> | undefined;
        const uploadedDocuments = (personalData?.uploadedDocuments || []) as Array<{
          id: string;
          type: string;
          base64: string;
          mimeType?: string;
          fileSize?: number;
        }>;
        const ocrResults = (personalData?.ocrResults || []) as Array<{
          documentType: string;
          extractedData: Record<string, unknown>;
          confidence: number;
        }>;

        // Create KYC verification records for each document
        for (const doc of uploadedDocuments) {
          const ocrResult = ocrResults.find(r => r.documentType === doc.type);

          // Create data URL from base64
          const fileUrl = `data:${doc.mimeType || 'image/jpeg'};base64,${doc.base64}`;

          // Calculate expiry (90 days from now for KYC validity)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 90);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (adminClient as any)
            .from('kyc_verifications')
            .insert({
              user_id: authData.user.id,
              document_type: doc.type,
              file_url: fileUrl,
              file_size: doc.fileSize || 0,
              mime_type: doc.mimeType || 'image/jpeg',
              extracted_data: ocrResult?.extractedData || {},
              validation_result: { confidence: ocrResult?.confidence || 0 },
              verified_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
              is_active: true,
            });
        }

        // Also create a billing profile (PF) from personal data
        if (personalData?.firstName || personalData?.lastName || personalData?.cnp) {
          const addr = personalData?.address as Record<string, unknown> | undefined;
          const addressParts = [
            addr?.street,
            addr?.number ? `Nr. ${addr.number}` : null,
            addr?.building ? `Bl. ${addr.building}` : null,
            addr?.apartment ? `Ap. ${addr.apartment}` : null,
            addr?.city,
            addr?.county,
          ].filter(Boolean);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (adminClient as any)
            .from('billing_profiles')
            .insert({
              user_id: authData.user.id,
              type: 'persoana_fizica',
              label: 'Profil implicit',
              billing_data: {
                firstName: String(personalData?.firstName || firstName),
                lastName: String(personalData?.lastName || lastName),
                cnp: String(personalData?.cnp || ''),
                address: addressParts.join(', '),
              },
              is_default: true,
            });
        }

        console.log(`KYC documents and billing profile saved for user ${authData.user.id}`);
      } catch (kycError) {
        console.error('KYC save error (non-critical):', kycError);
        // Don't fail registration if KYC save fails
      }
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation = !authData.session;

    // If we have a session, user is auto-authenticated
    // Return session info so client can set cookies properly
    const responseData: Record<string, unknown> = {
      success: true,
      message: requiresEmailConfirmation
        ? 'Cont creat cu succes! Verifică email-ul pentru confirmare.'
        : 'Cont creat cu succes!',
      data: {
        userId: authData.user.id,
        email: authData.user.email,
        verificationSent: requiresEmailConfirmation,
        orderLinked: true,
        // Include session if available (user can be auto-authenticated)
        isAuthenticated: !!authData.session,
      },
    };

    // Create response with session cookie if available
    const response = NextResponse.json(responseData);

    // If session exists, it's automatically set by Supabase client
    // The client just needs to refresh the auth state
    return response;
  } catch (error) {
    console.error('Register from order error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'A apărut o eroare. Te rugăm să încerci din nou.',
      },
      { status: 500 }
    );
  }
}
