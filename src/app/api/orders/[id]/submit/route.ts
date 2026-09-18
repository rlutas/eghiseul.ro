import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit, getAuditContext } from '@/lib/security/audit-logger';
import { createHash, timingSafeEqual } from 'crypto';
import { autoGenerateOrderDocuments } from '@/lib/documents/auto-generate';
import { uploadOrderSignature, uploadBase64, copyFile, getFileInfo, downloadFile } from '@/lib/aws/s3';
import { computeEstimatedCompletionISOForOrder, hasForeignDrivingLicense } from '@/lib/orders/order-estimate';
import { getMissingInvoiceClientFields } from '@/lib/oblio/invoice';
import { emailDomainAcceptsMail } from '@/lib/email-mx';
import { isIdentityFrontType, isPassportType, isSelfieType, identityFrontTypes } from '@/lib/kyc/identity-documents';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/submit
 *
 * Submits a draft order, changing its status to 'pending'.
 * Links the order to the authenticated user if not already linked.
 * Uses admin client to bypass RLS for reliable database operations.
 */
/** JPEG / PNG / WebP by magic bytes — what the wizard's scan and camera produce. */
function isImageBytes(b: Buffer): boolean {
  if (b.length < 12) return false;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true;
  return b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP';
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get user if authenticated (use regular client for auth)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Fetch the order (use admin client to bypass RLS)
    // Include service fields so we can compute the estimated completion date.
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*, services(slug, estimated_days, urgent_days, urgent_available, verification_config)')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found',
          },
        },
        { status: 404 }
      );
    }

    // Ownership. A linked order is submitted by its owner — or, for a phone
    // order the operator started, by the customer through the admin-issued
    // continuation link (`resume_token`, sent in the body). A guest request
    // without that token is refused BEFORE anything is read or copied
    // (Codex REV2-SEC-002).
    if (order.user_id) {
      const isOwner = !!user && order.user_id === user.id;
      const resumeToken = typeof body?.resumeToken === 'string' ? body.resumeToken : '';
      const storedToken = typeof order.resume_token === 'string' ? order.resume_token : '';
      const tokenLive =
        !!resumeToken && !!storedToken &&
        resumeToken.length === storedToken.length &&
        timingSafeEqual(Buffer.from(resumeToken), Buffer.from(storedToken)) &&
        !!order.resume_token_expires_at && new Date(order.resume_token_expires_at).getTime() > Date.now();
      if (!isOwner && !tokenLive) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to submit this order',
            },
          },
          { status: 403 }
        );
      }
    }

    // Only allow submitting draft orders
    if (order.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Order has already been submitted',
          },
        },
        { status: 400 }
      );
    }

    // ── Server-side KYC completeness guard ──────────────────────────────
    // The wizard gates documents client-side, but direct checkout links,
    // draft-resume flows or back-navigation can bypass the KYC step entirely
    // (real case: E-260708-AJ5M8 reached checkout without a selfie). Enforce
    // the same minimal requirements here so no client path can skip them.
    //
    // Order of operations (Codex rounds 2–3): (1) the trusted service config,
    // failing CLOSED on a read error; (2) for a signed-in account whose
    // identity document is on file, copy it into the order — server-side,
    // from the account's own row, never from client input; (3) the guard on
    // the persisted order-local set.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pk: any = null;
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: svcCfg, error: cfgError } = await (adminClient as any)
        .from('services')
        .select('verification_config')
        .eq('id', order.service_id)
        .single();
      if (cfgError) {
        console.error('[submit] KYC guard config lookup failed:', cfgError.message);
        return NextResponse.json(
          { success: false, error: { code: 'CONFIG_UNAVAILABLE', message: 'Nu am putut verifica cerințele serviciului. Reîncearcă în câteva secunde.' } },
          { status: 503 }
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pk = (svcCfg?.verification_config as any)?.personalKyc ?? null;
    }
    if (pk?.enabled) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cd = order.customer_data as any;
      const personalKey = cd?.personal ? 'personal' : cd?.personalData ? 'personalData' : 'personal';
      const personal = cd?.[personalKey] || (cd[personalKey] = {});
      const docs: Array<{ type?: string; s3Key?: string; base64?: string; mimeType?: string }> = personal.uploadedDocuments || (personal.uploadedDocuments = []);
      const citizenship = personal.citizenship || 'romanian';
      const isForeign = citizenship !== 'romanian';

      // `customer_data` is client-writable: a declared `type` proves nothing
      // (Codex REV2-CODE-001). Inline images are uploaded into the order's
      // own namespace NOW (not after the guard), and the guard below counts
      // only objects that exist under `kyc/<orderId>/`.
      let uploadedInline = false;
      for (const doc of docs) {
        if (!doc.base64 || doc.s3Key || !doc.type) continue;
        const raw = doc.base64.replace(/^data:[^;]+;base64,/, '');
        const bytes = Buffer.from(raw, 'base64');
        if (bytes.length < 2048 || bytes.length > 12 * 1024 * 1024 || !isImageBytes(bytes)) {
          // Not an image (or absurdly large) — drop the claim, do not upload garbage.
          delete doc.base64;
          continue;
        }
        try {
          const ext = doc.mimeType?.includes('png') ? 'png' : doc.mimeType?.includes('webp') ? 'webp' : 'jpg';
          const s3Key = `kyc/${id}/${String(doc.type).replace(/[^a-z0-9_]/gi, '')}.${ext}`;
          await uploadBase64(s3Key, doc.base64, doc.mimeType || 'image/jpeg', {
            'order-id': id,
            'document-type': String(doc.type),
            'uploaded-at': new Date().toISOString(),
          });
          doc.s3Key = s3Key;
          delete doc.base64;
          uploadedInline = true;
        } catch (uploadErr) {
          console.error('[submit] inline document upload failed:', uploadErr instanceof Error ? uploadErr.message : uploadErr);
        }
      }
      if (uploadedInline) {
        const { error: persistInlineError } = await adminClient
          .from('orders')
          .update({ customer_data: cd, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (persistInlineError) console.error('[submit] could not persist uploaded documents:', persistInlineError.message);
      }

      // (2) Identity from the account (feedback 18.09.2026, #20): the step
      // showed the account's document instead of asking for a scan, so the
      // order carries no front yet. Copy the account row's object into the
      // order's own namespace so admin/documents see it — unless the
      // customer explicitly chose another document (`useOtherDocument`).
      const hasFrontOnOrder = docs.some((d) => isIdentityFrontType(d.type || ''));
      if (order.user_id && !hasFrontOnOrder && personal.useOtherDocument !== true) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rows, error: rowsError } = await (adminClient as any)
          .from('kyc_verifications')
          .select('document_type, file_key, expires_at, verified_at')
          .eq('user_id', order.user_id)
          .eq('is_active', true)
          .in('document_type', [...identityFrontTypes()])
          .order('verified_at', { ascending: false });
        if (rowsError) {
          console.error('[submit] account identity lookup failed:', rowsError.message);
          return NextResponse.json(
            { success: false, error: { code: 'ACCOUNT_KYC_UNAVAILABLE', message: 'Nu am putut citi actul din contul tău. Reîncearcă în câteva secunde.' } },
            { status: 503 }
          );
        }
        const nowMs = Date.now();
        const row = ((rows ?? []) as Array<{ document_type: string; file_key: string | null; expires_at: string | null }>)
          .find((r) => !!r.file_key && (!r.expires_at || Date.parse(r.expires_at) > nowMs));
        if (row && row.file_key && row.file_key.startsWith(`kyc/${order.user_id}/`)) {
          try {
            const info = await getFileInfo(row.file_key);
            if (!(info.size > 0)) throw new Error('empty object');
            const ext = /\.([a-z0-9]+)$/i.exec(row.file_key)?.[1]?.toLowerCase() || 'jpg';
            const s3Key = `kyc/${id}/${row.document_type}.${ext}`;
            await copyFile(row.file_key, s3Key);
            docs.push({ type: row.document_type, s3Key, fromAccount: true, uploadedAt: new Date().toISOString() } as { type: string; s3Key: string });
            const { error: persistError } = await adminClient
              .from('orders')
              .update({ customer_data: cd, updated_at: new Date().toISOString() })
              .eq('id', id);
            if (persistError) throw new Error(persistError.message);
          } catch (copyErr) {
            console.error('[submit] account identity copy failed:', copyErr instanceof Error ? copyErr.message : copyErr);
            return NextResponse.json(
              { success: false, error: { code: 'ACCOUNT_KYC_COPY_FAILED', message: 'Nu am putut prelua actul din contul tău. Reîncearcă sau încarcă actul în pasul de verificare.' } },
              { status: 500 }
            );
          }
        }
      }

      // (3) The guard, on VERIFIED documents only: a key inside
      // `kyc/<orderId>/` whose object exists (HeadObject). A fabricated key
      // or a leftover base64 marker counts for nothing. One object cannot
      // stand in for two documents either: a „selfie" that is the same file
      // as the identity document is no selfie (REV3-KYC-001).
      const headCache = new Map<string, boolean>();
      const verifiedDocs: typeof docs = [];
      for (const d of docs) {
        if (!d.s3Key || !d.s3Key.startsWith(`kyc/${id}/`)) continue;
        if (!headCache.has(d.s3Key)) {
          try {
            const info = await getFileInfo(d.s3Key);
            headCache.set(d.s3Key, info.size > 0);
          } catch {
            headCache.set(d.s3Key, false);
          }
        }
        if (headCache.get(d.s3Key)) verifiedDocs.push(d);
      }
      // The selfie must be a DIFFERENT picture from the identity document —
      // compared by content (SHA-256 of the stored object), not by key.
      const digestOf = async (key: string) => createHash('sha256').update(await downloadFile(key)).digest('hex');
      const selfieDoc = verifiedDocs.find((d) => isSelfieType(d.type || ''));
      let selfieIsAnotherDoc = false;
      if (selfieDoc?.s3Key) {
        try {
          const selfieDigest = await digestOf(selfieDoc.s3Key);
          for (const d of verifiedDocs) {
            if (d === selfieDoc || isSelfieType(d.type || '') || !d.s3Key) continue;
            if (d.s3Key === selfieDoc.s3Key || (await digestOf(d.s3Key)) === selfieDigest) { selfieIsAnotherDoc = true; break; }
          }
        } catch (digestErr) {
          console.error('[submit] document digest failed:', digestErr instanceof Error ? digestErr.message : digestErr);
          selfieIsAnotherDoc = true; // cannot prove it is a different picture → not accepted
        }
      }
      const hasSelfie = !!selfieDoc && !selfieIsAnotherDoc;
      const has = (t: string) => verifiedDocs.some((d) => d.type === t);

      const missing: string[] = [];
      if (isForeign) {
        if (!verifiedDocs.some((d) => isPassportType(d.type || ''))) missing.push('pașaportul');
        if (!hasSelfie) missing.push('selfie cu actul de identitate');
        if (!has('residence_permit')) missing.push('permisul de rezidență / certificatul fiscal');
      } else {
        if (!verifiedDocs.some((d) => isIdentityFrontType(d.type || ''))) missing.push('actul de identitate');
        if (pk.selfieRequired && !hasSelfie) missing.push('selfie cu actul de identitate');
      }
      if (missing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'KYC_INCOMPLETE',
              message: `Lipsesc documente obligatorii: ${missing.join(', ')}. Te rugăm să revii la pasul de verificare a identității.`,
            },
          },
          { status: 400 }
        );
      }
    }

    // ── Server-side billing completeness guard ──────────────────────────
    // The wizard validates billing client-side only; fast double-taps on
    // «Continuă» and resumed drafts can reach submit with an incomplete
    // billing block (real case: E-260712-VQ3WA paid with just 4 chars of a
    // surname, and invoice EGH-0028 was issued with no address). Validate the
    // EFFECTIVE invoice client — after the same contact/KYC fallbacks the
    // Oblio builder applies — so KYC-backed orders with a sparse billing
    // block keep working.
    {
      const missingBilling = getMissingInvoiceClientFields(
        (order.customer_data as Parameters<typeof getMissingInvoiceClientFields>[0]) ?? {}
      );
      if (missingBilling.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BILLING_INCOMPLETE',
              message: `Datele de facturare sunt incomplete: lipsește ${missingBilling.join(', ')}. Te rugăm să revii la pasul „Facturare" și să completezi toate câmpurile.`,
            },
          },
          { status: 400 }
        );
      }
    }

    // ── Email domain deliverability guard ───────────────────────────────
    // Rejects domains that can't receive email at all (typo'd/made-up
    // domains → guaranteed bounce, client never learns the document is
    // ready). Fail-open on DNS trouble; can't catch wrong local parts on
    // valid domains (that's the bounce webhook's job). Context: E-260713-MG6MF.
    {
      const contactEmail = (order.customer_data as { contact?: { email?: string } } | null)
        ?.contact?.email;
      if (contactEmail) {
        const accepts = await emailDomainAcceptsMail(contactEmail);
        if (accepts === false) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'EMAIL_DOMAIN_INVALID',
                message: `Adresa de email „${contactEmail}" pare greșită — domeniul nu poate primi emailuri. Te rugăm să revii la pasul „Contact" și să corectezi adresa, altfel nu vei primi documentele.`,
              },
            },
            { status: 400 }
          );
        }
      }
    }

    // ── Tarif „permis emis în străinătate" (cazier auto) ────────────────
    // Prețul de bază e calculat în wizard (ca la variantele de constatator) și
    // persistat pe comandă, deci un client care umblă la payload-ul draftului ar
    // putea plăti tariful de permis românesc pentru o fișă cerută în străinătate.
    // Recalculăm din config înainte de plată și corectăm în sus dacă e nevoie.
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = order as any;
      const fl = o.services?.verification_config?.vehicleVerification?.foreignLicense;
      if (
        fl?.enabled &&
        typeof fl.price === 'number' &&
        fl.price > 0 &&
        hasForeignDrivingLicense(o.customer_data)
      ) {
        const currentBase = Number(o.base_price ?? 0);
        if (currentBase + 0.01 < fl.price) {
          const diff = Math.round((fl.price - currentBase) * 100) / 100;
          const newTotal = Math.round((Number(o.total_price ?? 0) + diff) * 100) / 100;
          await adminClient
            .from('orders')
            .update({ base_price: fl.price, total_price: newTotal })
            .eq('id', id);
          o.base_price = fl.price;
          o.total_price = newTotal;
          console.warn(
            `[submit] tarif permis străin corectat pe ${id}: base ${currentBase} → ${fl.price} (total ${newTotal})`
          );
        }
      }
    }

    // ── Preț traducere per limbă ────────────────────────────────────────
    // Limbile scumpe (nordice/slave) au preț propriu în admin_settings.
    // translation_price_list; wizardul îl aplică, dar payload-ul draftului e
    // editabil de client — recalculăm și corectăm ÎN SUS înainte de plată,
    // altfel daneza (cost 150 la traducător) s-ar plăti ca engleza.
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = order as any;
      const opts = Array.isArray(o.selected_options) ? o.selected_options : [];
      const hasTranslation = opts.some(
        (op: { code?: string }) => op?.code === 'traducere'
      );
      if (hasTranslation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: plRow } = await (adminClient as any)
          .from('admin_settings')
          .select('value')
          .eq('key', 'translation_price_list')
          .maybeSingle();
        const priceByLang = new Map<string, number>();
        const extraByLang = new Map<string, number>();
        for (const row of (plRow?.value as Array<{ language?: string; active?: boolean; clientPriceDoc?: number | null; clientPriceApostilaExtra?: number | null }> | null) ?? []) {
          if (row?.language && row.active && row.clientPriceDoc != null) {
            priceByLang.set(row.language, Number(row.clientPriceDoc));
            if (row.clientPriceApostilaExtra != null) {
              extraByLang.set(row.language, Number(row.clientPriceApostilaExtra));
            }
          }
        }
        // Cu Apostilă Haga pe comandă, traducerea are supliment (se traduce și apostila).
        const hasHaga = opts.some((op: { code?: string }) => op?.code === 'apostila_haga');
        let totalDiff = 0;
        const corrected = opts.map(
          (op: { code?: string; priceModifier?: number; quantity?: number; metadata?: { language?: string } }) => {
            if (op?.code !== 'traducere') return op;
            const lang = op.metadata?.language ?? '';
            const base = priceByLang.get(lang);
            const expected =
              base == null ? undefined : base + (hasHaga ? extraByLang.get(lang) ?? 0 : 0);
            const current = Number(op.priceModifier ?? 0);
            if (expected == null || current + 0.01 >= expected) return op;
            totalDiff += (expected - current) * Number(op.quantity ?? 1);
            return { ...op, priceModifier: expected };
          }
        );
        if (totalDiff > 0) {
          const newTotal = Math.round((Number(o.total_price ?? 0) + totalDiff) * 100) / 100;
          await adminClient
            .from('orders')
            .update({ selected_options: corrected, total_price: newTotal })
            .eq('id', id);
          o.selected_options = corrected;
          o.total_price = newTotal;
          console.warn(
            `[submit] preț traducere corectat pe ${id}: +${totalDiff.toFixed(2)} lei (total ${newTotal})`
          );
        }
      }
    }

    // Capture audit context (IP, user agent) from request
    const auditCtx = getAuditContext(request);
    const now = new Date().toISOString();

    // Compute estimated completion (holiday/cutoff-aware). Done at submission
    // so the customer sees a concrete date on the status/account pages even
    // before Stripe webhook fires. The webhook will overwrite only if this
    // field is NULL (see confirm-payment), so we keep it stable once set.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = (order as any).services as {
      estimated_days?: number | null;
      urgent_days?: number | null;
      urgent_available?: boolean | null;
    } | null;
    const estimatedCompletionISO = await computeEstimatedCompletionISOForOrder(
      adminClient,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order as any,
      svc,
      new Date(now)
    );

    // Build update object
    // Use 'pending' status (valid in database constraint)
    const updateData: Record<string, unknown> = {
      status: 'pending',
      updated_at: now,
      submitted_at: now,
      // The continuation link has done its job; it must not outlive the draft.
      resume_token: null,
      resume_token_expires_at: null,
      contract_signed_at: now,
      ...(estimatedCompletionISO ? { estimated_completion_date: estimatedCompletionISO } : {}),
    };

    // Update user profile with order data (phone, personal info)
    if (user) {
      // Check if profile exists first (use admin client)
      // Cast to any for columns not in generated types (birth_date, birth_place from migration 015)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (adminClient as any)
        .from('profiles')
        .select('id, phone, first_name, last_name, cnp, birth_date, birth_place')
        .eq('id', user.id)
        .single();

      // Extract customer data from order
      const customerData = order.customer_data as {
        contact?: { email?: string; phone?: string };
        personal?: { firstName?: string; lastName?: string; cnp?: string; birthDate?: string; birthPlace?: string };
      } | null;
      const contactData = customerData?.contact || {};
      const personalData = customerData?.personal || {};

      if (!profile) {
        // Create profile from order contact data
        await adminClient.from('profiles').insert({
          id: user.id,
          email: contactData.email || user.email,
          phone: contactData.phone || null,
          first_name: personalData.firstName || null,
          last_name: personalData.lastName || null,
          cnp: personalData.cnp || null,
          birth_date: personalData.birthDate || null,
          birth_place: personalData.birthPlace || null,
        });
      } else {
        // Update profile with any missing data from order
        const profileUpdates: Record<string, unknown> = {};

        // Update phone if missing or empty in profile but present in order
        if ((!profile.phone || profile.phone === '') && contactData.phone) {
          profileUpdates.phone = contactData.phone;
        }
        // Update other fields if missing
        if (!profile.first_name && personalData.firstName) {
          profileUpdates.first_name = personalData.firstName;
        }
        if (!profile.last_name && personalData.lastName) {
          profileUpdates.last_name = personalData.lastName;
        }
        if (!profile.cnp && personalData.cnp) {
          profileUpdates.cnp = personalData.cnp;
        }
        if (!profile.birth_date && personalData.birthDate) {
          profileUpdates.birth_date = personalData.birthDate;
        }
        if (!profile.birth_place && personalData.birthPlace) {
          profileUpdates.birth_place = personalData.birthPlace;
        }

        // Update profile if there are changes
        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updated_at = new Date().toISOString();
          await adminClient
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id);
        }
      }

      // Link order to user if not already linked
      if (!order.user_id) {
        updateData.user_id = user.id;
      }
    }

    // Update total price if provided
    if (body.total_price !== undefined) {
      updateData.total_price = body.total_price;
    }

    // Save signature, consent data, and audit metadata into customer_data
    const existingCustomerData = (order.customer_data as Record<string, unknown>) || {};

    // Compute document hash from the contract content the client signed
    // This proves which contract version was agreed to
    const contractContentForHash = JSON.stringify({
      customer_data: existingCustomerData,
      total_price: body.total_price || order.total_price,
      service_id: order.service_id,
    });
    const documentHash = createHash('sha256').update(contractContentForHash).digest('hex');

    // Build signature metadata for legal validity (Law 214/2024, eIDAS Art. 25)
    const signatureMetadata = {
      ip_address: auditCtx.ipAddress,
      user_agent: auditCtx.userAgent,
      signed_at: now,
      document_hash: documentHash,
      consent: {
        terms_accepted: body.consent?.termsAccepted === true,
        privacy_accepted: body.consent?.privacyAccepted === true,
        signature_consent: body.consent?.signatureConsent === true,
        withdrawal_waiver: body.consent?.withdrawalWaiver === true,
        consent_timestamp: now,
      },
    };

    // Upload signature to S3 (removes large base64 from JSONB)
    let signatureS3Key: string | undefined;
    if (body.signature_base64) {
      try {
        const result = await uploadOrderSignature(id, body.signature_base64);
        signatureS3Key = result.key;
      } catch (e) {
        console.error('Failed to upload signature to S3, falling back to JSONB:', e);
      }
    }

    // Upload KYC documents (CI front, CI back, selfie) to S3
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const personalData = (existingCustomerData.personal || existingCustomerData.personalData) as any;
    if (personalData?.uploadedDocuments?.length > 0) {
      for (const doc of personalData.uploadedDocuments) {
        if (doc.base64 && !doc.s3Key) {
          try {
            const ext = doc.mimeType?.includes('png') ? 'png' : 'jpg';
            const contentType = doc.mimeType || 'image/jpeg';
            const s3Key = `kyc/${id}/${doc.type || doc.id || 'document'}.${ext}`;

            await uploadBase64(s3Key, doc.base64, contentType, {
              'order-id': id,
              'document-type': doc.type || 'unknown',
              'uploaded-at': new Date().toISOString(),
            });
            doc.s3Key = s3Key;
            // Remove base64 to keep DB lean
            delete doc.base64;
          } catch (err) {
            console.error(`Failed to upload KYC doc ${doc.type} to S3:`, err);
            // Keep base64 as fallback if S3 upload fails
          }
        }
      }
    }

    // Upload company KYC documents to S3 (if PJ)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyData = (existingCustomerData.company || existingCustomerData.companyData) as any;
    if (companyData?.uploadedDocuments?.length > 0) {
      for (const doc of companyData.uploadedDocuments) {
        if (doc.base64 && !doc.s3Key) {
          try {
            const ext = doc.mimeType?.includes('png') ? 'png' : doc.mimeType?.includes('pdf') ? 'pdf' : 'jpg';
            const contentType = doc.mimeType || 'image/jpeg';
            const s3Key = `kyc/${id}/company_${doc.type || doc.id || 'document'}.${ext}`;

            await uploadBase64(s3Key, doc.base64, contentType, {
              'order-id': id,
              'document-type': doc.type || 'unknown',
              'uploaded-at': new Date().toISOString(),
            });
            doc.s3Key = s3Key;
            delete doc.base64;
          } catch (err) {
            console.error(`Failed to upload company KYC doc ${doc.type} to S3:`, err);
          }
        }
      }
    }

    updateData.customer_data = {
      ...existingCustomerData,
      // Store S3 key if upload succeeded, otherwise fall back to inline base64
      ...(signatureS3Key
        ? { signature_s3_key: signatureS3Key }
        : body.signature_base64
          ? { signature_base64: body.signature_base64 }
          : {}),
      signature_metadata: signatureMetadata,
    };

    // Update the order (use admin client to bypass RLS)
    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Order submit error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to submit order',
          },
        },
        { status: 500 }
      );
    }

    // Auto-generate documents (contract-complet, imputernicire, cerere)
    try {
      const docResults = await autoGenerateOrderDocuments(id, user?.id || null);
      if (docResults.length > 0) {
        console.log(`Auto-generated ${docResults.length} documents for order ${id}`);
      }
    } catch (docError) {
      // Don't fail the submission if document generation fails
      console.error('Auto-document generation failed (order still submitted):', docError);
    }

    // Create order_history entry for submission (audit trail)
    await adminClient.from('order_history').insert({
      order_id: id,
      changed_by: user?.id || null,
      event_type: 'order_submitted',
      new_value: {
        status: 'pending',
        document_hash: documentHash,
        consent: signatureMetadata.consent,
      },
      ip_address: auditCtx.ipAddress,
      user_agent: auditCtx.userAgent,
      notes: 'Comanda trimisă cu semnătură electronică',
    });

    // Audit log for compliance
    logAudit({
      action: 'order_update',
      status: 'success',
      userId: user?.id || null,
      ipAddress: auditCtx.ipAddress,
      userAgent: auditCtx.userAgent,
      resourceType: 'order',
      resourceId: id,
      metadata: {
        event: 'order_submitted',
        document_hash: documentHash,
        has_signature: !!body.signature_base64,
        consent_given: signatureMetadata.consent,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: updatedOrder.id,
          friendly_order_id: updatedOrder.friendly_order_id,
          status: updatedOrder.status,
          user_id: updatedOrder.user_id,
          total_price: updatedOrder.total_price,
          updated_at: updatedOrder.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/orders/[id]/submit:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
