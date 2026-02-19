'use client';

/**
 * ContractPreview Component
 *
 * Fetches and displays a pre-filled contract preview (HTML) at the signature step.
 * When the client draws a signature, it appears live in the contract preview.
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SIGNATURE_PLACEHOLDER_HTML = '<div class="sig-placeholder">Semnătura va apărea aici</div>';
const SIGNATURE_PLACEHOLDER_REGEX = /<div class="sig-placeholder">Semnătura va apărea aici<\/div>/g;

export default function ContractPreview() {
  const { state, service, priceBreakdown } = useModularWizard();
  const [baseHtml, setBaseHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const fetchedRef = useRef(false);

  const signatureBase64 = state.signature?.signatureBase64;

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchPreview() {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          serviceSlug: state.serviceSlug || 'cazier-judiciar',
          serviceName: service?.name || '',
          contact: {
            email: state.contact.email,
            phone: state.contact.phone,
          },
          personalData: state.personalKyc ? {
            firstName: state.personalKyc.firstName,
            lastName: state.personalKyc.lastName,
            cnp: state.personalKyc.cnp,
            documentSeries: state.personalKyc.documentSeries,
            documentNumber: state.personalKyc.documentNumber,
            documentIssuedBy: state.personalKyc.documentIssuedBy,
            documentIssueDate: state.personalKyc.documentIssueDate,
            address: state.personalKyc.address,
          } : undefined,
          companyData: state.companyKyc ? {
            companyName: state.companyKyc.companyName,
            cui: state.companyKyc.cui,
            registrationNumber: state.companyKyc.registrationNumber,
            address: state.companyKyc.address,
          } : undefined,
          billing: state.billing ? {
            type: state.billing.type,
            companyName: state.billing.companyName,
            cui: state.billing.cui,
            companyAddress: state.billing.companyAddress,
          } : undefined,
          totalPrice: priceBreakdown.totalPrice,
          servicePrice: priceBreakdown.basePrice,
          orderId: state.orderId || undefined,
          friendlyOrderId: state.friendlyOrderId || undefined,
        };

        const response = await fetch('/api/contracts/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to load contract preview');
        }

        const data = await response.json();
        if (data.success && data.html) {
          setBaseHtml(data.html);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Contract preview error:', err);
        setError('Nu s-a putut genera previzualizarea contractului.');
      } finally {
        setLoading(false);
      }
    }

    fetchPreview();
  }, []);

  // When the user draws a signature, replace placeholders with the actual image
  const displayHtml = useMemo(() => {
    if (!baseHtml) return null;

    if (signatureBase64) {
      const sigImg = `<div class="sig-image"><img src="data:image/png;base64,${signatureBase64}" alt="Semnătura clientului" /></div>`;
      return baseHtml.replace(SIGNATURE_PLACEHOLDER_REGEX, sigImg);
    }

    return baseHtml;
  }, [baseHtml, signatureBase64]);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contracte - Previzualizare
          </div>
          <Button variant="ghost" size="sm" type="button">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Citiți contractele de mai jos înainte de a semna
        </p>
      </CardHeader>
      {expanded && (
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Se generează previzualizarea...
              </span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {displayHtml && !loading && (
            <>
              <style>{contractPreviewStyles}</style>
              <div
                className="contract-preview max-h-[500px] overflow-y-auto border rounded-lg p-6 bg-white"
                dangerouslySetInnerHTML={{ __html: displayHtml }}
              />
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

const contractPreviewStyles = `
  .contract-preview {
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 13px;
    line-height: 1.6;
    color: #1a1a1a;
  }

  .contract-preview p {
    margin: 6px 0;
  }

  .contract-preview strong {
    font-weight: 700;
  }

  .contract-preview em {
    font-style: italic;
  }

  /* Contract section headers */
  .contract-preview p:first-child {
    font-size: 15px;
    text-align: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
  }

  /* Signature tables */
  .contract-preview table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    border: 1px solid #e2e8f0;
  }

  .contract-preview table th,
  .contract-preview table td {
    padding: 12px 16px;
    text-align: center;
    vertical-align: top;
    border: 1px solid #e2e8f0;
    width: 50%;
  }

  .contract-preview table th {
    background: #f8fafc;
    font-weight: 600;
  }

  .contract-preview table th p,
  .contract-preview table td p {
    margin: 2px 0;
    text-align: center;
  }

  /* Signature placeholder box */
  .sig-placeholder {
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    color: #94a3b8;
    font-style: italic;
    margin: 4px 0;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  /* Non-client signature placeholder (prestator/lawyer - stays static) */
  .sig-other {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
    color: #b0b8c4;
    font-style: italic;
    margin: 4px 0;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    background: #f8fafc;
  }

  /* Signature image (after user signs) */
  .sig-image {
    padding: 4px 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sig-image img {
    max-width: 180px;
    max-height: 60px;
    object-fit: contain;
  }

  /* Signature images rendered from DOCX (company/lawyer) */
  .contract-preview table img {
    max-width: 180px;
    max-height: 70px;
    object-fit: contain;
    display: block;
    margin: 4px auto;
  }

  /* Links */
  .contract-preview a {
    color: #2563eb;
    text-decoration: underline;
  }

  /* Clean up extra whitespace from mammoth conversion */
  .contract-preview br + br {
    display: none;
  }

  /* Scrollbar styling */
  .contract-preview::-webkit-scrollbar {
    width: 6px;
  }

  .contract-preview::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .contract-preview::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 3px;
  }

  .contract-preview::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;
