import { NextRequest, NextResponse } from 'next/server';

async function extractPDF(buffer: Buffer): Promise<string> {
  const PDFParserModule = await import('pdf2json');
  const PDFParser = PDFParserModule.default || PDFParserModule;
  
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(errData.parserError);
    });
    
    pdfParser.on('pdfParser_dataReady', () => {
      resolve(pdfParser.getRawTextContent());
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

async function extractDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

async function extractPPTX(buffer: Buffer): Promise<string> {
  const AdmZip = (await import('adm-zip')).default;
  const { XMLParser } = await import('fast-xml-parser');

  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
 
  const parser = new XMLParser({
    ignoreAttributes: false,
    textNodeName: '#text',
  });
  const slideTexts: string[] = [];
  // PPTX slides live in ppt/slides/slide*.xml
  const slideEntries = entries
    .filter(e => e.entryName.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)?.[0] ?? '0');
      const numB = parseInt(b.entryName.match(/\d+/)?.[0] ?? '0');
      return numA - numB;
    });

  for (const entry of slideEntries) {
    const xml = entry.getData().toString('utf8');
    const parsed = parser.parse(xml);

    // Recursively collect all text nodes from a:t elements
    const texts: string[] = [];
    function collectText(obj: unknown): void {
      if (typeof obj === 'string' || typeof obj === 'number') {
        const s = String(obj).trim();
        if (s) texts.push(s);
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach(collectText);
        return;
      }
      if (obj && typeof obj === 'object') {
        const rec = obj as Record<string, unknown>;
        // a:t is the text run element in PPTX
        if ('a:t' in rec) collectText(rec['a:t']);
        // Also traverse all other keys
        Object.values(rec).forEach(collectText);
      }
    }
    collectText(parsed);
    if (texts.length) slideTexts.push(texts.join(' '));
  }

  return slideTexts.join('\n\n');
}

function cleanExtractedText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse 3+ newlines to 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove null bytes and control chars except newline/tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Trim each line
    .split('\n').map(l => l.trim()).join('\n')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 20 MB.' }, { status: 413 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = '';
    let format = '';

    if (name.endsWith('.pdf')) {
      rawText = await extractPDF(buffer);
      format = 'PDF';
    } else if (name.endsWith('.docx')) {
      rawText = await extractDOCX(buffer);
      format = 'DOCX';
    } else if (name.endsWith('.doc')) {
      // .doc (old binary format) — try mammoth, it handles some .doc files
      try {
        rawText = await extractDOCX(buffer);
      } catch {
        return NextResponse.json({
          error: 'Old .doc format is partially supported. Try saving as .docx for best results.',
        }, { status: 422 });
      }
      format = 'DOC';
    } else if (name.endsWith('.pptx')) {
      rawText = await extractPPTX(buffer);
      format = 'PPTX';
    } else if (name.endsWith('.ppt')) {
      return NextResponse.json({
        error: 'Old .ppt files are not supported. Open in PowerPoint and save as .pptx.',
      }, { status: 422 });
    } else if (name.endsWith('.txt') || name.endsWith('.md')) {
      rawText = buffer.toString('utf8');
      format = 'TEXT';
    } else {
      return NextResponse.json({
        error: 'Unsupported file type. Supported: PDF, DOCX, PPTX, TXT, MD.',
      }, { status: 415 });
    }

    const text = cleanExtractedText(rawText);

    if (!text || text.length < 20) {
      return NextResponse.json({
        error: 'Could not extract readable text from this file. It may be scanned/image-based or encrypted.',
      }, { status: 422 });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      text,
      wordCount,
      format,
      chars: text.length,
      fileName: file.name,
    });

  } catch (err) {
    console.error('[extract-text] Error:', err);
    return NextResponse.json({
      error: 'Failed to extract text. The file may be corrupted or password-protected.',
    }, { status: 500 });
  }
}
