/**
 * GET /api/orders/[id]/documents/[docId]/preview?email=xxx
 *
 * Public document preview - converts DOCX to HTML for in-browser viewing.
 * Access controlled by order ID + email verification (same as status page).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDownloadUrl } from '@/lib/aws/s3';
import mammoth from 'mammoth';

interface RouteParams {
  params: Promise<{ id: string; docId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId, docId } = await params;
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return new NextResponse('Missing email parameter', { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch order and verify email matches customer_data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (adminClient as any)
      .from('orders')
      .select('id, friendly_order_id, customer_data')
      .eq('id', orderId)
      .single();

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Verify email matches order contact email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderEmail = (order.customer_data as Record<string, any>)?.contact?.email;
    if (!orderEmail || orderEmail.toLowerCase() !== email.toLowerCase()) {
      return new NextResponse('Access denied', { status: 403 });
    }

    // Fetch document and verify it's visible to client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc } = await (adminClient as any)
      .from('order_documents')
      .select('id, s3_key, file_name, visible_to_client')
      .eq('id', docId)
      .eq('order_id', orderId)
      .eq('visible_to_client', true)
      .single();

    if (!doc) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Fetch DOCX from S3
    const url = await getDownloadUrl(doc.s3_key, 300);
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse('Failed to fetch document', { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const result = await mammoth.convertToHtml({ buffer });
    const docHtml = result.value;
    const fileName = doc.file_name || 'document.docx';

    const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName} - eGhiseul.ro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      color: #333;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #1a1a2e;
      color: white;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .toolbar h1 { font-size: 14px; font-weight: 500; opacity: 0.9; }
    .toolbar .order-id { font-size: 12px; opacity: 0.6; }
    .toolbar button {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .toolbar button:hover { background: rgba(255,255,255,0.25); }
    .page {
      max-width: 800px;
      margin: 32px auto;
      background: white;
      padding: 60px 72px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      border-radius: 4px;
      min-height: 900px;
      line-height: 1.6;
    }
    .page h1, .page h2, .page h3 { margin: 16px 0 8px; }
    .page p { margin: 8px 0; }
    .page table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    .page table td, .page table th {
      border: 1px solid #ddd;
      padding: 6px 10px;
      text-align: left;
    }
    .page img { max-width: 150px; max-height: 60px; object-fit: contain; }
    @media print {
      .toolbar { display: none; }
      body { background: white; }
      .page { box-shadow: none; margin: 0; padding: 40px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <h1>${fileName}</h1>
      <div class="order-id">Comanda: ${order.friendly_order_id || orderId}</div>
    </div>
    <div>
      <button onclick="window.print()">Printează</button>
    </div>
  </div>
  <div class="page">
    ${docHtml}
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Public document preview error:', error);
    return new NextResponse('Failed to preview document', { status: 500 });
  }
}
