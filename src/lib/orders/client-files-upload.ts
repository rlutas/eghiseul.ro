/**
 * Browser side of `POST /api/orders/[id]/client-files`: compress photos (a
 * 5 MB phone photo of an old CF extract becomes ~400 KB and stays readable),
 * ask for a presigned URL, PUT the bytes to S3, return the stored entry.
 */

import { compressImage, ImageCompressionError } from '@/lib/images/compress';
import { CLIENT_FILE_MAX_BYTES, type ClientFile } from '@/lib/orders/client-files';

export interface ClientFileAuth {
  /** Wizard draft: contact email + optional resume token. */
  email?: string;
  resumeToken?: string | null;
  /** Status page: the order-client token. */
  token?: string | null;
}

const IMAGE_RX = /^image\/(jpeg|png|webp)$/;

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export async function uploadClientFile(
  orderId: string,
  file: File,
  auth: ClientFileAuth
): Promise<ClientFile> {
  if (file.size === 0) {
    throw new Error('Fișierul este gol. Dacă ai ales poza din galerie, fă-o direct cu camera.');
  }

  let body: Blob = file;
  let mimeType = file.type;
  if (IMAGE_RX.test(file.type) || /heic|heif/i.test(file.type)) {
    try {
      const compressed = await compressImage(file, { maxEdge: 2200, quality: 0.85 });
      body = base64ToBlob(compressed.base64, compressed.mimeType);
      mimeType = compressed.mimeType;
    } catch (e) {
      if (e instanceof ImageCompressionError) throw new Error(e.message);
      throw e;
    }
  } else if (file.type !== 'application/pdf') {
    throw new Error('Acceptăm poze (JPG, PNG, WebP) sau PDF.');
  }
  if (body.size > CLIENT_FILE_MAX_BYTES) {
    throw new Error('Fișierul are peste 10 MB. Trimite o poză sau un PDF mai mic.');
  }

  const presign = await fetch(`/api/orders/${orderId}/client-files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType: mimeType,
      fileSize: body.size,
      filename: file.name,
      email: auth.email,
      resumeToken: auth.resumeToken || undefined,
      token: auth.token || undefined,
    }),
  });
  const json = await presign.json().catch(() => ({}));
  if (!presign.ok || !json.success) {
    throw new Error(json.error || 'Nu am putut pregăti încărcarea. Încearcă din nou.');
  }

  const put = await fetch(json.data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body,
  });
  if (!put.ok) throw new Error('Încărcarea a eșuat. Verifică conexiunea și încearcă din nou.');

  return {
    key: json.data.key,
    name: file.name.slice(0, 120),
    mimeType,
    size: body.size,
    uploadedAt: new Date().toISOString(),
  };
}
