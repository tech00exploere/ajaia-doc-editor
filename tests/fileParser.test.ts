import { describe, it, expect } from 'vitest';
import { parseFileToHtml } from '../src/lib/fileParser';

describe('File Import Parsers', () => {
  it('should parse plain text (.txt) into HTML paragraphs', async () => {
    const textContent = 'First paragraph.\n\nSecond paragraph with text.';
    const buffer = Buffer.from(textContent, 'utf-8');
    const result = await parseFileToHtml(buffer, 'notes.txt');

    expect(result.title).toBe('notes');
    expect(result.html).toContain('<p>First paragraph.</p>');
    expect(result.html).toContain('<p>Second paragraph with text.</p>');
  });

  it('should parse Markdown (.md) formatting to HTML', async () => {
    const mdContent = `# Project Specs\n\nThis is **bold** and *italic* text.\n\n- Feature 1\n- Feature 2`;
    const buffer = Buffer.from(mdContent, 'utf-8');
    const result = await parseFileToHtml(buffer, 'specs.md');

    expect(result.title).toBe('specs');
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('Project Specs');
    expect(result.html).toContain('<strong>bold</strong>');
    expect(result.html).toContain('<em>italic</em>');
    expect(result.html).toContain('<ul>');
  });

  it('should throw an error for unsupported file types', async () => {
    const buffer = Buffer.from('dummy binary data');
    await expect(parseFileToHtml(buffer, 'image.png')).rejects.toThrow(
      'Unsupported file extension .png'
    );
  });
});
