/**
 * Ads audit pipeline v0.
 * Inspection/competitor mode — no live account access required.
 * Drives ads-audit skill framework via Vercel AI SDK (multi-provider).
 *
 * Provider selection (first available key wins):
 *   ANTHROPIC_API_KEY → claude-opus-4-7
 *   GEMINI_API_KEY    → gemini-2.5-pro
 */
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs/promises';
import path from 'path';
import { collectPublicSignals, type AdSignals } from './signals';
import { renderMarkdownToPdf, renderMarkdownToHtml } from './renderer';

export interface AdsAuditOptions {
  domain: string;
  /** Optional output directory override. Defaults to clients/<slug>/audits/<date>/ads/ */
  outputDir?: string;
  /** Skip PDF generation (faster for CI/testing) */
  skipPdf?: boolean;
}

export interface AdsAuditResult {
  outputDir: string;
  reportPath: string;
  actionPlanPath: string;
  quickWinsPath: string;
  pdfPath: string | null;
  domain: string;
  signals: AdSignals;
}

function getAIModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic('claude-opus-4-7');
  }
  if (process.env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    // Use flash model for cost efficiency; upgrade to gemini-2.5-pro when available
    return google('gemini-2.0-flash');
  }
  throw new Error(
    'No AI provider API key found. Set ANTHROPIC_API_KEY or GEMINI_API_KEY environment variable.',
  );
}

const AUDIT_SYSTEM_PROMPT = `You are a senior paid-advertising strategist performing a comprehensive ads audit.
You are operating in INSPECTION / COMPETITOR MODE — you have no direct account access.
Your analysis must be based entirely on public signals provided to you.

You follow the Verticality Ads Audit framework:

PLATFORMS TO ASSESS:
- Google Ads (conversion tracking signals, probable campaign structure, quality indicators)
- Meta Ads (Pixel health from public signals, estimated ad presence from library hints)
- LinkedIn Ads (Insight Tag detection, B2B suitability)
- TikTok Ads (Pixel detection, creative suitability for business type)
- Microsoft Ads (UET tag detection, search network opportunity)

SCORING (0-100 per platform, based on available signals):
- Google: Conversion 25%, Waste 20%, Structure 15%, Keywords 15%, Ads 15%, Settings 10%
- Meta: Pixel/CAPI 30%, Creative 30%, Structure 20%, Audience 20%
- LinkedIn: Tech 25%, Audience 25%, Creative 20%, Lead Gen 15%, Budget 15%
- TikTok: Creative 30%, Tech 25%, Bidding 20%, Structure 15%, Performance 10%
- Microsoft: Tech 25%, Syndication 20%, Structure 20%, Creative 20%, Settings 15%

INSPECTION MODE SCORING RULES:
- If a pixel/tag is NOT detected for a platform: score 0-30 (high risk — tracking not set up or platform not used)
- If detected but minimal signals: 30-60 (moderate — platform in use but optimization unknown)
- Use business type and industry to estimate platform suitability
- Flag undetected pixels/tracking as CRITICAL issues (revenue/data loss risk)

OUTPUT FORMAT:
You must produce exactly THREE sections separated by the exact markers shown below.
Each section will be saved as a separate file.

---BEGIN ADS-AUDIT-REPORT---
[Full comprehensive multi-platform findings in markdown]
---END ADS-AUDIT-REPORT---

---BEGIN ADS-ACTION-PLAN---
[Prioritized recommendations in markdown]
---END ADS-ACTION-PLAN---

---BEGIN ADS-QUICK-WINS---
[Quick wins fixable in <15 min in markdown]
---END ADS-QUICK-WINS---

REPORT must include:
1. Executive Summary with Aggregate Ads Health Score (0-100) and letter grade (A/B/C/D/F)
2. Per-platform section for each platform with score, findings, and remediation
3. Cross-platform analysis
4. Strategic recommendations
5. Cover block with domain, date, mode: Inspection

ACTION PLAN must prioritize:
Critical → High → Medium → Low with estimated fix time and expected impact.

QUICK WINS must list only items fixable in under 15 minutes with high impact.
Sort by (severity × estimated_impact) DESC.`;

function buildUserPrompt(signals: AdSignals, date: string): string {
  return `Perform a full ads audit for: ${signals.domain}
Date: ${date}
Mode: Inspection (competitor/public signals only)

## Collected Public Signals

**Page Title:** ${signals.pageTitle}
**Page Description:** ${signals.pageDescription}
**Detected Business Type:** ${signals.businessType}
**Industry:** ${signals.industry}
**Has E-commerce indicators:** ${signals.hasEcommerce}
**Has Lead Form / Demo CTA:** ${signals.hasLeadForm}

**Tracking Pixels / Tags Detected:**
${signals.pixelsDetected.length > 0 ? signals.pixelsDetected.map((p) => `- ✅ ${p}`).join('\n') : '- ⚠️ No ad tracking pixels detected'}

**Notable Third-Party Scripts / Domains:**
${signals.scriptsFound.slice(0, 20).map((s) => `- ${s}`).join('\n') || '- (none detected)'}

**Meta Ad Library Note:**
${signals.metaAdsLibraryHint}

## Platforms NOT Detected (no pixel/tag found)
${['Google Ads (gtag)', 'Meta Pixel', 'LinkedIn Insight Tag', 'TikTok Pixel', 'Microsoft UET']
  .filter((p) => !signals.pixelsDetected.some((d) => d.startsWith(p.split(' ')[0])))
  .map((p) => `- ❌ ${p}`)
  .join('\n') || '- All major platforms detected'}

Please produce the full audit report, action plan, and quick wins now.`;
}

function extractSection(text: string, begin: string, end: string): string {
  const start = text.indexOf(begin);
  const finish = text.indexOf(end);
  if (start === -1 || finish === -1) return text;
  return text.slice(start + begin.length, finish).trim();
}

export async function runAdsAudit(opts: AdsAuditOptions): Promise<AdsAuditResult> {
  const { domain, skipPdf = false } = opts;
  const slug = domain
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const date = new Date().toISOString().split('T')[0];
  const outDir = opts.outputDir ?? path.join('clients', slug, 'audits', date, 'ads');
  await fs.mkdir(outDir, { recursive: true });

  console.log(`[ads-audit] Collecting public signals for ${domain}…`);
  const signals = await collectPublicSignals(domain);

  console.log(
    `[ads-audit] Signals collected. Pixels found: ${signals.pixelsDetected.join(', ') || 'none'}`,
  );
  console.log(`[ads-audit] Running AI audit…`);

  const model = getAIModel();

  const { text: rawOutput } = await generateText({
    model,
    system: AUDIT_SYSTEM_PROMPT,
    prompt: buildUserPrompt(signals, date),
    maxTokens: 8192,
  });

  const report = extractSection(rawOutput, '---BEGIN ADS-AUDIT-REPORT---', '---END ADS-AUDIT-REPORT---');
  const actionPlan = extractSection(rawOutput, '---BEGIN ADS-ACTION-PLAN---', '---END ADS-ACTION-PLAN---');
  const quickWins = extractSection(rawOutput, '---BEGIN ADS-QUICK-WINS---', '---END ADS-QUICK-WINS---');

  // Save markdown files
  const reportPath = path.join(outDir, 'ADS-AUDIT-REPORT.md');
  const actionPlanPath = path.join(outDir, 'ADS-ACTION-PLAN.md');
  const quickWinsPath = path.join(outDir, 'ADS-QUICK-WINS.md');
  const rawPath = path.join(outDir, 'raw-ai-output.txt');

  await Promise.all([
    fs.writeFile(reportPath, report, 'utf8'),
    fs.writeFile(actionPlanPath, actionPlan, 'utf8'),
    fs.writeFile(quickWinsPath, quickWins, 'utf8'),
    fs.writeFile(rawPath, rawOutput, 'utf8'),
  ]);

  console.log(`[ads-audit] Markdown reports saved to ${outDir}`);

  // Render HTML preview + PDF
  await renderMarkdownToHtml(report, path.join(outDir, 'report.html'), `Ads Audit — ${domain}`);

  let pdfPath: string | null = null;
  if (!skipPdf) {
    pdfPath = path.join(outDir, 'report.pdf');
    console.log(`[ads-audit] Rendering PDF…`);
    await renderMarkdownToPdf(report, pdfPath, `Ads Audit — ${domain}`);
    console.log(`[ads-audit] PDF saved: ${pdfPath}`);
  }

  console.log(`\n✅  Ads audit complete: ${outDir}`);
  console.log(`    Report:      ${reportPath}`);
  console.log(`    Action Plan: ${actionPlanPath}`);
  console.log(`    Quick Wins:  ${quickWinsPath}`);
  if (pdfPath) console.log(`    PDF:         ${pdfPath}`);

  return { outputDir: outDir, reportPath, actionPlanPath, quickWinsPath, pdfPath, domain, signals };
}
