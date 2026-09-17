import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authErrorToRomanian } from '@/lib/auth/error-messages';
import { isStorableKycDocumentType, isIdentityDocumentType } from '@/lib/kyc/identity-documents';
import {
  copyFile,
  generateKycKey,
  getDownloadUrl,
  getExtensionFromContentType,
  uploadKycDocument,
  type KycDocumentType,
} from '@/lib/aws/s3';
import { KYC_VALIDITY_DAYS } from '@/lib/kyc/constants';
import {
  isCompanyBilling,
  companyProfileFromOrder,
  personProfileFromOrder,
} from '@/lib/account/order-to-billing-profile';
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

      // Everything else, including Supabase rate limits, used to leak the raw
      // English GoTrue message with a 400. Translate it and keep the real status
      // so the client can tell "try later" apart from "you did something wrong".
      const info = authErrorToRomanian(authError.message, authError.code);
      return NextResponse.json(
        {
          error: 'Registration failed',
          message: info.message,
          retryAfterSeconds: info.retryAfterSeconds,
        },
        { status: info.isRateLimit ? 429 : 400 }
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
          /** Where the wizard put the image. Present on every recent order. */
          s3Key?: string;
          /** Legacy: an inline image, with no S3 object behind it. */
          base64?: string;
          mimeType?: string;
          fileSize?: number;
        }>;
        const ocrResults = (personalData?.ocrResults || []) as Array<{
          documentType: string;
          extractedData: Record<string, unknown>;
          confidence: number;
        }>;

        // Copy each scanned document from the order into the account.
        //
        // The order's documents are ALREADY in S3, at `kyc/<orderId>/<type>.jpg`
        // — `customer_data.personal.uploadedDocuments` carries `s3Key`, never
        // `base64`. This loop used to read `doc.base64` and write it into
        // `file_url` as a `data:` URL, so it saved nothing for any of the 183
        // paid orders that have documents; the 5 base64 rows in the table came
        // from an older path.
        //
        // The copy is server-side (CopyObject), so no image is downloaded or
        // re-uploaded. It has to happen: `/api/upload/download` presigns a
        // `kyc/` key only when the key contains the caller's user id, so a row
        // pointing at the order's key would be unreadable from the account.
        //
        // Every insert is checked. Before migration 171 the CHECK on
        // `document_type` rejected `act_identitate`, `passport_opened` and the
        // rest, and this loop failed on every document without anyone knowing,
        // because the result was never read.
        for (const doc of uploadedDocuments) {
          if (!isStorableKycDocumentType(doc.type)) {
            console.warn(`register-from-order: skipping unknown document type ${doc.type}`);
            continue;
          }

          const ocrResult = ocrResults.find(r => r.documentType === doc.type);
          const mimeType = doc.mimeType || 'image/jpeg';
          const verificationId = randomUUID();
          // The document's own expiry when the OCR read one and it is still in
          // the future; otherwise the standard validity of a stored scan. Same
          // rule as `api/user/kyc/save`, so a document copied from an order does
          // not outlive one uploaded in the account.
          const ocrExpiry = ocrResult?.extractedData?.expiryDate;
          const parsedExpiry = typeof ocrExpiry === 'string' ? new Date(ocrExpiry) : null;
          const expiresAt =
            parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) && parsedExpiry > new Date()
              ? parsedExpiry
              : new Date(Date.now() + KYC_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

          let fileKey: string;
          try {
            if (doc.s3Key) {
              fileKey = generateKycKey(
                authData.user.id,
                verificationId,
                doc.type as KycDocumentType,
                getExtensionFromContentType(mimeType)
              );
              await copyFile(doc.s3Key, fileKey);
            } else if (doc.base64) {
              // Legacy shape: an inline image with no S3 object behind it.
              const uploaded = await uploadKycDocument(
                authData.user.id,
                verificationId,
                doc.type as KycDocumentType,
                doc.base64,
                mimeType
              );
              fileKey = uploaded.key;
            } else {
              console.warn(`register-from-order: ${doc.type} has neither s3Key nor base64`);
              continue;
            }
          } catch (copyError) {
            // A failed copy must not cost the customer their account: the rest
            // of the profile is still worth saving, and the document can be
            // uploaded again from the account.
            console.error(`register-from-order: could not copy ${doc.type} into the account:`, copyError);
            continue;
          }

          const fileUrl = await getDownloadUrl(fileKey);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: kycInsertError } = await (adminClient as any)
            .from('kyc_verifications')
            .insert({
              id: verificationId,
              user_id: authData.user.id,
              document_type: doc.type,
              file_url: fileUrl,
              file_key: fileKey,
              file_size: doc.fileSize || null,
              mime_type: mimeType,
              extracted_data: ocrResult?.extractedData || {},
              validation_result: { confidence: ocrResult?.confidence || 0 },
              verified_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
              is_active: true,
            });

          if (kycInsertError) {
            console.error(
              `register-from-order: could not save ${doc.type} to kyc_verifications:`,
              kycInsertError.message
            );
            continue;
          }

          // `kyc_verified` is what the wizard and `/submit` read to skip the
          // identity step next time. Only an identity document may set it — a
          // selfie or a driving licence proves nothing on its own.
          if (isIdentityDocumentType(doc.type)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: flagError } = await (adminClient as any)
              .from('profiles')
              .update({ kyc_verified: true, updated_at: new Date().toISOString() })
              .eq('id', authData.user.id);
            if (flagError) {
              console.error('register-from-order: kyc_verified not set:', flagError.message);
            }
          }
        }

        // Billing profile, from the order that was just paid. The mapping and
        // the reason a half-filled profile is not saved at all are in
        // `src/lib/account/order-to-billing-profile.ts`.
        const billing = (customerData?.billing || {}) as Record<string, unknown>;

        if (isCompanyBilling(billing)) {
          const companyProfile = companyProfileFromOrder(billing);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: billingError } = await (adminClient as any)
            .from('billing_profiles')
            .insert({
              user_id: authData.user.id,
              type: 'persoana_juridica',
              label: companyProfile.label,
              billing_data: companyProfile,
              is_default: true,
            });
          if (billingError) {
            console.error('register-from-order: PJ billing profile not saved:', billingError.message);
          }
        } else {
          const personProfile = personProfileFromOrder(billing, personalData, {
            firstName,
            lastName,
          });
          if (personProfile) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: billingError } = await (adminClient as any)
              .from('billing_profiles')
              .insert({
                user_id: authData.user.id,
                type: 'persoana_fizica',
                label: personProfile.label,
                billing_data: personProfile,
                is_default: true,
              });
            if (billingError) {
              console.error('register-from-order: PF billing profile not saved:', billingError.message);
            }
          } else {
            console.warn(
              `register-from-order: order ${orderId} has no billing address complete enough to save`
            );
          }
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
