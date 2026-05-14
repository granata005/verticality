#!/usr/bin/env tsx
/**
 * SEO Audit Pipeline — drive the seo-audit skill for a domain and produce
 * a structured deliverable folder with markdown report + PDF.
 *
 * Usage:
 *   npx tsx scripts/run-seo-audit.ts --domain example.com
 *   npx tsx scripts/run-seo-audit.ts --domain example.com --client "Acme Corp"
 *   npx tsx scripts/run-seo-audit.ts --domain example.com --out /custom/path
 *
 * Output structure:
 *   clients/<slug>/audits/<YYYY-MM-DD>/
 *     report.md        — full audit findings
 *     action-plan.md   — prioritized recommendations
 *     report.pdf       — client-ready PDF
 *     raw/             — raw subagent artifacts (screenshots, individual section files)
 */

import { spawnSync, SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(`--${flag}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const domain = getArg('domain');
if (!domain) {
  console.error('Usage: npx tsx scripts/run-seo-audit.ts --domain <domain> [--client <name>] [--out <dir>]');
  process.exit(1);
}

const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
const slug = cleanDomain.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const repoRoot = path.resolve(__dirname, '..');
const auditRoot = path.resolve(getArg('out') ?? path.join(repoRoot, 'clients', slug, 'audits', today));
const rawDir = path.join(auditRoot, 'raw');

// ---------------------------------------------------------------------------
// Directory setup
// ---------------------------------------------------------------------------

fs.mkdirSync(rawDir, { recursive: true });

console.log('');
console.log('┌─ SEO Audit Pipeline ─────────────────────────────');
console.log(`│  Domain  : ${cleanDomain}`);
console.log(`│  Output  : ${auditRoot}`);
console.log('└──────────────────────────────────────────────────');
console.log('');

// ---------------------------------------------------------------------------
// Run claude with seo-audit skill
// ---------------------------------------------------------------------------

const prompt = `Domain to audit: ${cleanDomain}

Please run the seo-audit skill for this domain. Follow the skill instructions exactly — run all applicable sub-agents (seo-technical, seo-content, seo-schema, seo-sitemap, seo-performance, seo-visual, seo-geo). Save ALL output files in the current directory.

When done, ensure FULL-AUDIT-REPORT.md and ACTION-PLAN.md exist in the current directory.`;

console.log('⏳ Running SEO audit (this may take 10–25 minutes)...');
console.log('   Spawning claude with seo-audit skill...\n');

const claudeResult: SpawnSyncReturns<string> = spawnSync(
  'claude',
  [
    '--print',
    '--dangerously-skip-permissions',
    '--add-dir', repoRoot,
    '--max-budget-usd', '5',
    prompt,
  ],
  {
    cwd: rawDir,
    encoding: 'utf-8',
    timeout: 40 * 60 * 1000, // 40 min hard cap
    maxBuffer: 100 * 1024 * 1024,
    env: { ...process.env },
  }
);

// Log stderr for debugging
if (claudeResult.stderr) {
  const stderr = claudeResult.stderr.trim();
  if (stderr) process.stderr.write(stderr + '\n');
}

if (claudeResult.error) {
  console.error('\n❌ Audit failed:', claudeResult.error.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Collect outputs
// ---------------------------------------------------------------------------

const reportDst = path.join(auditRoot, 'report.md');
const actionDst = path.join(auditRoot, 'action-plan.md');

// Main report — look for standard output file names
const reportCandidates = [
  'FULL-AUDIT-REPORT.md',
  'SEO-AUDIT-REPORT.md',
  'AUDIT-REPORT.md',
  'audit-report.md',
].map(f => path.join(rawDir, f));

const reportSrc = reportCandidates.find(p => fs.existsSync(p));

if (reportSrc) {
  fs.copyFileSync(reportSrc, reportDst);
  console.log('✅ report.md');
} else {
  // Fallback: write claude stdout as the report
  const fallback = claudeResult.stdout?.trim() ?? '';
  fs.writeFileSync(reportDst, fallback || `# SEO Audit — ${cleanDomain}\n\n_Audit ran but produced no structured output._\n`);
  console.log('✅ report.md (from stdout fallback)');
}

const actionSrc = path.join(rawDir, 'ACTION-PLAN.md');
if (fs.existsSync(actionSrc)) {
  fs.copyFileSync(actionSrc, actionDst);
  console.log('✅ action-plan.md');
}

// ---------------------------------------------------------------------------
// Generate PDF
// ---------------------------------------------------------------------------

const scriptDir = path.join(repoRoot, 'scripts');
const pdfDst = path.join(auditRoot, 'report.pdf');

console.log('\n📄 Generating PDF...');
const pdfResult = spawnSync(
  'python3',
  [path.join(scriptDir, 'generate_pdf.py'), reportDst, pdfDst],
  { encoding: 'utf-8', timeout: 120_000 }
);

if (pdfResult.status === 0) {
  console.log('✅ report.pdf');
} else {
  console.warn('⚠️  PDF generation failed:', pdfResult.stderr?.slice(-400) ?? pdfResult.error?.message);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`
✅ Audit complete!

📁 ${auditRoot}
   report.md        — full audit findings
   action-plan.md   — prioritized recommendations (if generated)
   report.pdf       — client-ready PDF (if generated)
   raw/             — raw subagent artifacts
`);
