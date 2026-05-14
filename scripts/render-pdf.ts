#!/usr/bin/env node
/**
 * One-shot PDF renderer — renders a markdown file to PDF.
 * Usage: npx tsx scripts/render-pdf.ts <input.md> <output.pdf> [title]
 */
import { renderMarkdownToPdf } from '../lib/audit/renderer';
import fs from 'fs/promises';

const [inputPath, outputPath, title] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error('Usage: npx tsx scripts/render-pdf.ts <input.md> <output.pdf> [title]');
  process.exit(1);
}

async function main() {
  const markdown = await fs.readFile(inputPath, 'utf8');
  await renderMarkdownToPdf(markdown, outputPath, title ?? 'Report');
  console.log(`PDF saved: ${outputPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
