import PizZip from 'pizzip';

/**
 * Describes a single signature to be inserted into a DOCX document.
 */
export interface SignatureEntry {
  /** The marker text in the rendered DOCX (e.g. 'SIG_CLIENT') */
  marker: string;
  /** Base64-encoded PNG image data */
  base64: string;
  /** Unique name for the image file (e.g. 'signature_client') */
  name: string;
  /** Width in points (default: 120) */
  widthPt?: number;
  /** Height in points (default: 40) */
  heightPt?: number;
}

/**
 * Insert multiple signature images into a rendered DOCX by replacing
 * marker text runs with inline DrawingML images.
 *
 * Each signature gets its own image file, relationship ID, and DrawingML block.
 *
 * Steps per signature:
 * 1. Add PNG to word/media/{name}.png
 * 2. Add image relationship in word/_rels/document.xml.rels
 * 3. Replace marker text with DrawingML inline image XML
 * 4. Ensure [Content_Types].xml has PNG content type
 */
export function insertSignatureImages(
  docxBuffer: Buffer,
  signatures: SignatureEntry[]
): Buffer {
  if (signatures.length === 0) return docxBuffer;

  const zip = new PizZip(docxBuffer);

  // Find the current max rId across all relationships
  const relsPath = 'word/_rels/document.xml.rels';
  let relsXml = zip.file(relsPath)?.asText() || '';
  const existingIds = [...relsXml.matchAll(/Id="(rId\d+)"/g)].map(m =>
    parseInt(m[1].replace('rId', ''), 10)
  );
  let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 100;

  // Load document XML
  const docXmlPath = 'word/document.xml';
  let docXml = zip.file(docXmlPath)?.asText() || '';

  let docPrId = 100;

  for (const sig of signatures) {
    const imgFileName = `${sig.name}.png`;
    const relId = `rId${nextId++}`;
    const widthEmu = (sig.widthPt || 120) * 12700;
    const heightEmu = (sig.heightPt || 40) * 12700;

    // 1. Add image to word/media/
    const imgBuffer = Buffer.from(sig.base64, 'base64');
    zip.file(`word/media/${imgFileName}`, imgBuffer);

    // 2. Add relationship
    relsXml = relsXml.replace(
      '</Relationships>',
      `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imgFileName}"/></Relationships>`
    );

    // 3. Build DrawingML inline image
    const drawingXml = buildDrawingXml(relId, imgFileName, widthEmu, heightEmu, docPrId++);

    // Replace marker text runs with drawing
    // The marker might be split across multiple <w:t> runs by docxtemplater,
    // but since we use short uppercase markers, they usually stay in one run.
    docXml = docXml.replace(
      new RegExp(
        `(<w:r[^>]*>(?:<w:rPr>[\\s\\S]*?<\\/w:rPr>)?)<w:t[^>]*>${escapeRegExp(sig.marker)}<\\/w:t>(<\\/w:r>)`,
        'g'
      ),
      `$1${drawingXml}$2`
    );
  }

  // Write back relationships and document
  zip.file(relsPath, relsXml);
  zip.file(docXmlPath, docXml);

  // 4. Ensure [Content_Types].xml has PNG content type
  const contentTypesPath = '[Content_Types].xml';
  let contentTypes = zip.file(contentTypesPath)?.asText() || '';
  if (!contentTypes.includes('Extension="png"')) {
    contentTypes = contentTypes.replace(
      '</Types>',
      '<Default Extension="png" ContentType="image/png"/></Types>'
    );
    zip.file(contentTypesPath, contentTypes);
  }

  return Buffer.from(zip.generate({ type: 'nodebuffer' }));
}

function buildDrawingXml(
  relId: string,
  fileName: string,
  widthEmu: number,
  heightEmu: number,
  docPrId: number
): string {
  return `<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:docPr id="${docPrId}" name="${fileName}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${fileName}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
