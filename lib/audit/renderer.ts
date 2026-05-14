/**
 * Shared HTML→PDF renderer used by both the SEO and Ads audit pipelines.
 * Converts a markdown string to a styled PDF via Playwright headless Chromium.
 */
import { chromium } from 'playwright';
import { marked } from 'marked';
import fs from 'fs/promises';
import path from 'path';

const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; line-height: 1.6; color: #1a1a1a;
    padding: 48px 56px; max-width: 900px; margin: 0 auto;
  }
  h1 { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 6px; margin-top: 32px; }
  h2 { font-size: 18px; font-weight: 600; color: #222; margin-top: 28px; margin-bottom: 8px;
       border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; }
  h3 { font-size: 15px; font-weight: 600; color: #333; margin-top: 20px; margin-bottom: 6px; }
  h4 { font-size: 13px; font-weight: 600; color: #444; margin-top: 14px; margin-bottom: 4px; }
  p { margin-bottom: 10px; }
  ul, ol { margin-left: 20px; margin-bottom: 10px; }
  li { margin-bottom: 4px; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-size: 12px;
  }
  pre { background: #f3f4f6; padding: 12px 16px; border-radius: 6px; overflow: auto;
        margin-bottom: 10px; }
  pre code { background: none; padding: 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }
  th { background: #f3f4f6; font-weight: 600; text-align: left; padding: 6px 10px;
       border: 1px solid #e5e7eb; }
  td { padding: 5px 10px; border: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #fafafa; }
  blockquote { border-left: 3px solid #6366f1; padding-left: 14px; color: #555; margin: 10px 0; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .cover { text-align: center; padding: 60px 0 40px; border-bottom: 2px solid #e5e7eb; margin-bottom: 32px; }
  .cover h1 { font-size: 32px; margin-bottom: 10px; }
  .cover .meta { color: #666; font-size: 13px; }
  .score-badge {
    display: inline-block; padding: 4px 12px; border-radius: 20px;
    font-weight: 700; font-size: 14px; margin-left: 8px;
  }
  .grade-a { background: #dcfce7; color: #166534; }
  .grade-b { background: #dbeafe; color: #1e40af; }
  .grade-c { background: #fef9c3; color: #854d0e; }
  .grade-d { background: #ffedd5; color: #9a3412; }
  .grade-f { background: #fee2e2; color: #991b1b; }
  @media print {
    body { padding: 24px 32px; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
  }
`;

function buildHtml(markdownBody: string, title: string): string {
  const body = marked.parse(markdownBody) as string;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>${PAGE_CSS}</style>
</head>
<body>${body}</body>
</html>`;
}

export async function renderMarkdownToPdf(
  markdown: string,
  outputPath: string,
  title = 'Audit Report',
): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const html = buildHtml(markdown, title);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
    });
  } finally {
    await browser.close();
  }
}

export async function renderMarkdownToHtml(
  markdown: string,
  outputPath: string,
  title = 'Audit Report',
): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const html = buildHtml(markdown, title);
  await fs.writeFile(outputPath, html, 'utf8');
}
