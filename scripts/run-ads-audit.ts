#!/usr/bin/env node
/**
 * Ads audit pipeline runner — v0
 *
 * Usage:
 *   npx tsx scripts/run-ads-audit.ts <domain> [output-dir] [--skip-pdf]
 *
 * Examples:
 *   npx tsx scripts/run-ads-audit.ts shopify.com
 *   npx tsx scripts/run-ads-audit.ts example.com clients/example/audits/2026-05-14/ads
 *   npx tsx scripts/run-ads-audit.ts shopify.com --skip-pdf
 *
 * Env vars (first available wins):
 *   ANTHROPIC_API_KEY  → uses claude-opus-4-7
 *   GEMINI_API_KEY     → uses gemini-2.5-pro
 *
 * Output structure:
 *   clients/<slug>/audits/<YYYY-MM-DD>/ads/
 *     ADS-AUDIT-REPORT.md
 *     ADS-ACTION-PLAN.md
 *     ADS-QUICK-WINS.md
 *     report.html
 *     report.pdf
 *     raw-ai-output.txt
 */
import { runAdsAudit } from '../lib/audit/ads-pipeline';

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('-'));

const domain = args[0];
const outputDir = args[1];
const skipPdf = flags.includes('--skip-pdf');

if (!domain) {
  console.error('Usage: npx tsx scripts/run-ads-audit.ts <domain> [output-dir] [--skip-pdf]');
  console.error('Example: npx tsx scripts/run-ads-audit.ts shopify.com');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
  console.error('Error: Set ANTHROPIC_API_KEY (claude-opus-4-7) or GEMINI_API_KEY (gemini-2.5-pro)');
  process.exit(1);
}

runAdsAudit({ domain, outputDir, skipPdf }).catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
