import { marked } from 'marked';
import mammoth from 'mammoth';

export async function parseFileToHtml(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ title: string; html: string }> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const title = fileName.replace(/\.[^/.]+$/, '') || 'Imported Document';

  if (extension === 'txt') {
    const text = fileBuffer.toString('utf-8');
    const paragraphs = text
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    if (paragraphs.length === 0) {
      return { title, html: '<p></p>' };
    }
    const html = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    return { title, html };
  }

  if (extension === 'md' || extension === 'markdown') {
    const markdown = fileBuffer.toString('utf-8');
    const rawHtml = await marked.parse(markdown);
    return { title, html: rawHtml.trim() };
  }

  if (extension === 'docx') {
    const result = await mammoth.convertToHtml({ buffer: fileBuffer });
    return { title, html: result.value || '<p></p>' };
  }

  throw new Error(`Unsupported file extension .${extension}. Supported: .txt, .md, .docx`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
