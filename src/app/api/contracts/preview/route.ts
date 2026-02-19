import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateDocument, type DocumentContext, type ClientData, type CompanyData, type LawyerData } from '@/lib/documents/generator';
import { downloadFile } from '@/lib/aws/s3';
import mammoth from 'mammoth';

/**
 * Format an AddressState object (or string) into a human-readable Romanian address.
 */
function formatAddress(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address !== 'object') return '';

  const a = address as Record<string, string>;
  const parts: string[] = [];
  if (a.street) parts.push(`Str. ${a.street}`);
  if (a.number) parts.push(`Nr. ${a.number}`);
  if (a.building) parts.push(`Bl. ${a.building}`);
  if (a.staircase) parts.push(`Sc. ${a.staircase}`);
  if (a.floor) parts.push(`Et. ${a.floor}`);
  if (a.apartment) parts.push(`Ap. ${a.apartment}`);
  if (a.city) parts.push(a.city);
  if (a.county) parts.push(`Jud. ${a.county}`);
  if (a.postalCode) parts.push(a.postalCode);
  return parts.join(', ');
}

interface PreviewRequestBody {
  serviceSlug: string;
  serviceName: string;
  contact: {
    email: string;
    phone: string;
  };
  personalData?: {
    firstName?: string;
    lastName?: string;
    cnp?: string;
    documentSeries?: string;
    documentNumber?: string;
    documentIssuedBy?: string;
    documentIssueDate?: string;
    address?: Record<string, string>;
  };
  companyData?: {
    companyName?: string;
    cui?: string;
    registrationNumber?: string;
    address?: Record<string, string>;
  };
  billing?: {
    type?: string;
    companyName?: string;
    cui?: string;
    companyAddress?: string;
  };
  totalPrice: number;
  servicePrice: number;
  orderId?: string;
  friendlyOrderId?: string;
}

/**
 * POST /api/contracts/preview
 *
 * Generates a contract preview (HTML) from wizard data.
 * No auth required (guests use this too).
 * Uses the same contract-prestari + contract-asistenta templates as auto-generate
 * to ensure the preview matches the final generated documents.
 */
export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequestBody = await request.json();

    if (!body.serviceSlug || !body.contact?.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch company and lawyer data from admin_settings
    const adminClient = createAdminClient();
    const { data: settings } = await (adminClient as any)
      .from('admin_settings')
      .select('key, value')
      .in('key', ['company_data', 'lawyer_data']);

    const settingsMap: Record<string, any> = {};
    for (const s of settings || []) {
      settingsMap[s.key] = s.value;
    }

    const companyData: CompanyData = settingsMap.company_data || {};
    const lawyerData: LawyerData = settingsMap.lawyer_data || {};

    // Build client data from request
    const personal = body.personalData || {};
    const company = body.companyData || {};
    const billing = body.billing || {};

    const isPJ = billing.type === 'persoana_juridica' || !!company.companyName;

    const personalAddress = typeof personal.address === 'object' ? personal.address : undefined;
    const companyAddress = typeof company.address === 'object' ? company.address : undefined;

    const clientData: ClientData = {
      name: `${personal.firstName || ''} ${personal.lastName || ''}`.trim() || company.companyName || 'N/A',
      firstName: personal.firstName || '',
      lastName: personal.lastName || '',
      cnp: personal.cnp || '',
      cui: company.cui || billing.cui || '',
      email: body.contact.email,
      phone: body.contact.phone || '',
      address: formatAddress(personal.address),
      ci_series: personal.documentSeries || '',
      ci_number: personal.documentNumber || '',
      document_issued_by: personal.documentIssuedBy || '',
      document_issue_date: personal.documentIssueDate || '',
      company_name: company.companyName || billing.companyName || '',
      company_reg: company.registrationNumber || '',
      company_address: formatAddress(company.address) || billing.companyAddress || '',
      is_pj: isPJ,
      address_parts: personalAddress ? {
        county: personalAddress.county, city: personalAddress.city,
        sector: personalAddress.sector,
        street: personalAddress.street, number: personalAddress.number,
        building: personalAddress.building, staircase: personalAddress.staircase,
        floor: personalAddress.floor, apartment: personalAddress.apartment,
        postalCode: personalAddress.postalCode,
      } : undefined,
      company_address_parts: companyAddress ? {
        county: companyAddress.county, city: companyAddress.city,
        street: companyAddress.street, number: companyAddress.number,
        building: companyAddress.building, apartment: companyAddress.apartment,
      } : undefined,
    };

    // Extract client IP from request headers
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'N/A';

    const context: DocumentContext = {
      client: clientData,
      company: companyData,
      lawyer: lawyerData,
      order: {
        order_number: body.orderId || 'DRAFT',
        friendly_order_id: body.friendlyOrderId || 'DRAFT',
        total_price: body.totalPrice || 0,
        service_name: body.serviceName || '',
        service_price: body.servicePrice || 0,
        created_at: new Date().toISOString(),
      },
      document_numbers: {
        contract_number: 0,
        imputernicire_number: 0,
      },
      client_ip: clientIp,
    };

    // Download company/lawyer signatures from S3 for preview
    let companySignatureBase64: string | undefined;
    let lawyerSignatureBase64: string | undefined;

    if (companyData.signature_s3_key) {
      try {
        const buf = await downloadFile(companyData.signature_s3_key);
        companySignatureBase64 = buf.toString('base64');
      } catch { /* signature not available */ }
    }
    if (lawyerData.signature_s3_key) {
      try {
        const buf = await downloadFile(lawyerData.signature_s3_key);
        lawyerSignatureBase64 = buf.toString('base64');
      } catch { /* signature not available */ }
    }

    // Generate both contract-prestari and contract-asistenta separately
    // (same templates as auto-generate.ts, which use CLIENT_DETAILS_BLOCK)
    const templates = ['contract-prestari', 'contract-asistenta'];
    const htmlParts: string[] = [];

    for (const template of templates) {
      const buffer = generateDocument(body.serviceSlug, template, context, {
        companySignatureBase64,
        lawyerSignatureBase64,
      });

      const result = await mammoth.convertToHtml({ buffer });
      htmlParts.push(result.value);
    }

    // Combine both contracts with a visual separator
    let html = htmlParts.join(
      '<hr style="border:none;border-top:2px solid #e2e8f0;margin:32px 0;" />'
    );

    // Remove ONLY template decorative images (small ones), keep signature images
    // Signature images are larger (>500 chars of base64), template images are small
    html = html.replace(/<img[^>]*src="data:image\/png;base64,([^"]*)"[^>]*\/?>/g, (match, base64) => {
      // Keep images with substantial content (signatures), remove tiny template decorations
      if (base64.length > 500) return match;
      return '';
    });

    // Clean up empty <strong> and <p> tags left after image removal
    html = html.replace(/<strong><\/strong>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');

    // Smart signature placement:
    // Table 1 (Contract Prestari): PRESTATOR|BENEFICIAR - company signature left, client placeholder right
    // Table 2 (Contract Asistenta): FORMA DE EXERCITARE - lawyer signature left, client placeholder right
    // Table 3 (Nota de Informare): single column, client signature placeholder

    html = html.replace(/<table>([\s\S]*?)<\/table>/g, (tableMatch) => {
      const hasPrestator = tableMatch.includes('PRESTATOR');
      const hasFormaExercitare = tableMatch.includes('FORMA DE EXERCITARE');

      if (hasPrestator) {
        // Table 1: Contract Prestari signature table
        let cellIndex = 0;
        return tableMatch.replace(/<th>([\s\S]*?)<\/th>/g, (cellMatch, content) => {
          cellIndex++;
          const trimmed = content.replace(/<[^>]*>/g, '').trim();
          // Cell 1: prestator - if no real signature image, show placeholder
          if (cellIndex === 1 && !content.includes('<img')) {
            if (trimmed === '') {
              return `<th><div class="sig-other">Semnătura prestator</div></th>`;
            }
          }
          // Cell 2: beneficiar - add client signature placeholder before name (if no image)
          if (cellIndex === 2 && trimmed && trimmed !== 'BENEFICIAR' && !content.includes('<img')) {
            return `<th><div class="sig-placeholder">Semnătura va apărea aici</div>${content}</th>`;
          }
          return cellMatch;
        });
      } else if (hasFormaExercitare) {
        // Table 2: Contract Asistenta signature table
        let rowIndex = 0;
        return tableMatch.replace(/<tr>([\s\S]*?)<\/tr>/g, (rowMatch) => {
          rowIndex++;
          if (rowIndex === 2) {
            let cellIdx = 0;
            return rowMatch.replace(/<th>([\s\S]*?)<\/th>/g, (cellMatch, content) => {
              cellIdx++;
              const trimmed = content.replace(/<[^>]*>/g, '').trim();
              // Only replace with placeholder if cell has no real image
              if (!content.includes('<img')) {
                if (trimmed === '') {
                  if (cellIdx === 1) {
                    return `<th><div class="sig-other">Semnătura avocat</div></th>`;
                  } else {
                    return `<th><div class="sig-placeholder">Semnătura va apărea aici</div></th>`;
                  }
                }
              }
              return cellMatch;
            });
          }
          return rowMatch;
        });
      } else {
        // Table 3: Nota de Informare - single column, client signature
        return tableMatch.replace(/<th>([\s\S]*?)<\/th>/g, (cellMatch, content) => {
          const trimmed = content.replace(/<[^>]*>/g, '').trim();
          if (trimmed && !trimmed.includes('Semnatura') && !content.includes('<img')) {
            return `<th><div class="sig-placeholder">Semnătura va apărea aici</div>${content}</th>`;
          }
          return cellMatch;
        });
      }
    });

    // Handle remaining empty cells
    html = html.replace(/<th>\s*<\/th>/g, '<th><div class="sig-other">-</div></th>');
    html = html.replace(/<td>\s*<\/td>/g, '<td><div class="sig-other">-</div></td>');

    return NextResponse.json({
      success: true,
      html,
    });
  } catch (error) {
    console.error('Contract preview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
