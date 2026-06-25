import { describe, it, expect } from 'vitest';
import { parseGeminiOCRResponse } from '@/lib/services/document-ocr';

describe('parseGeminiOCRResponse (robust la markdown/array)', () => {
  it('parsează obiect simplu', () => {
    const r = parseGeminiOCRResponse('{"success":true,"confidence":99,"extractedData":{"cnp":"123"}}', 'passport');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe(99);
  });

  it('parsează JSON înfășurat în ```json fences```', () => {
    const txt = '```json\n{"success":true,"confidence":95,"extractedData":{"cnp":"x"}}\n```';
    const r = parseGeminiOCRResponse(txt, 'passport');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe(95);
  });

  it('parsează ARRAY cu un element [{...}] (Gemini întoarce uneori așa)', () => {
    const txt = '```json\n[{"success":true,"confidence":88,"extractedData":{"cnp":"y"}}]\n```';
    const r = parseGeminiOCRResponse(txt, 'ro_cei_reader_pdf' as never);
    expect(r.success).toBe(true);
    expect(r.confidence).toBe(88);
  });

  it('text fără JSON → eroare (confidence 0)', () => {
    const r = parseGeminiOCRResponse('nu am putut citi', 'passport');
    expect(r.success).toBe(false);
    expect(r.confidence).toBe(0);
  });
});
