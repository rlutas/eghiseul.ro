/**
 * GET /api/admin/orders/[id]/preview-document?key=S3_KEY
 *
 * Fetches a DOCX from S3 and converts it to HTML for in-browser preview.
 * Returns a full HTML page that can be opened in a new tab.
 *
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getDownloadUrl } from '@/lib/aws/s3';
import mammoth from 'mammoth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      await requirePermission(user.id, 'documents.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const s3Key = request.nextUrl.searchParams.get('key');
    const autoPrint = request.nextUrl.searchParams.get('print') === '1';
    if (!s3Key) {
      return new NextResponse('Missing key parameter', { status: 400 });
    }

    // Verify order exists
    const adminClient = createAdminClient();
    const { data: order } = await adminClient
      .from('orders')
      .select('id, friendly_order_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Get presigned URL and fetch the DOCX
    const url = await getDownloadUrl(s3Key, 300);
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse('Failed to fetch document from S3', { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ buffer });
    const docHtml = result.value;

    // Extract filename from S3 key
    const fileName = s3Key.split('/').pop() || 'document.docx';

    // Generate a presigned download URL for the DOCX original
    const downloadUrl = await getDownloadUrl(s3Key, 900);

    // Return a full HTML page with styling
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
    .toolbar h1 {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
    }
    .toolbar .order-id {
      font-size: 12px;
      opacity: 0.6;
    }
    .toolbar .actions {
      display: flex;
      gap: 8px;
    }
    .toolbar button, .toolbar a.btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
      text-decoration: none;
      display: inline-block;
    }
    .toolbar button:hover, .toolbar a.btn:hover {
      background: rgba(255,255,255,0.25);
    }
    .toolbar .btn-primary {
      background: rgba(59,130,246,0.8);
      border-color: rgba(59,130,246,0.9);
    }
    .toolbar .btn-primary:hover {
      background: rgba(59,130,246,1);
    }
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
    .page table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
    }
    .page table td, .page table th {
      border: 1px solid #ddd;
      padding: 6px 10px;
      text-align: left;
    }
    .page ul, .page ol { padding-left: 24px; margin: 8px 0; }
    .page img { max-width: 150px; max-height: 60px; object-fit: contain; }
    .warnings {
      max-width: 800px;
      margin: 0 auto 8px;
      padding: 8px 16px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      font-size: 12px;
      color: #856404;
      display: ${result.messages.length > 0 ? 'block' : 'none'};
    }
    .note {
      max-width: 800px;
      margin: 0 auto 8px;
      padding: 8px 16px;
      background: #e8f4fd;
      border: 1px solid #bee5eb;
      border-radius: 4px;
      font-size: 12px;
      color: #0c5460;
    }
    @media print {
      .toolbar { display: none; }
      .warnings { display: none; }
      .note { display: none; }
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
    <div class="actions">
      <a class="btn btn-primary" href="${downloadUrl}" download="${fileName}">Descarca DOCX</a>
      <button onclick="window.print()">Printeaza</button>
      <button onclick="window.close()">Inchide</button>
    </div>
  </div>
  <div class="note">Aceasta este o previzualizare HTML. Pentru documentul original cu formatare completa, folositi butonul "Descarca DOCX".</div>
  ${result.messages.length > 0 ? `<div class="warnings">Avertismente conversie: ${result.messages.map(m => m.message).join('; ')}</div>` : ''}
  <div class="page">
    ${docHtml}
  </div>
  ${autoPrint ? '<script>window.onload = function() { window.print(); }</script>' : ''}
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Preview document error:', error);
    return new NextResponse('Failed to preview document', { status: 500 });
  }
}
