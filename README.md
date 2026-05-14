# Verticality

Internal tooling for the Verticality SEO & Ads agency.

## SEO Audit Pipeline

Run a full SEO audit for any domain and get a client-ready deliverable (Markdown + PDF).

### Prerequisites

```bash
npm install          # installs tsx and other JS deps
pip install markdown playwright
playwright install chromium
```

### Usage

```bash
npx tsx scripts/run-seo-audit.ts --domain example.com
npx tsx scripts/run-seo-audit.ts --domain example.com --client "Acme Corp"
```

One command produces the full deliverable folder. Typical runtime: 10–25 minutes.

### Output Structure

```
clients/
  <domain-slug>/
    audits/
      <YYYY-MM-DD>/
        report.md        ← full SEO audit findings
        action-plan.md   ← prioritized recommendations (Critical → Low)
        report.pdf       ← client-ready A4 PDF
        raw/             ← raw subagent artifacts
          FULL-AUDIT-REPORT.md
          ACTION-PLAN.md
          screenshots/   ← desktop + mobile captures
          *.md           ← per-section subagent outputs
```

### What the report covers

Following the `seo-audit` skill, each report includes:

| Section | Weight |
|---------|--------|
| Technical SEO (crawlability, indexability, security) | 22% |
| Content Quality (E-E-A-T, thin content, readability) | 23% |
| On-Page SEO (titles, metas, headings, internal links) | 20% |
| Schema / Structured Data | 10% |
| Performance (Core Web Vitals) | 10% |
| AI Search Readiness (GEO, llms.txt, citability) | 10% |
| Images (alt text, formats) | 5% |

### PDF generation (standalone)

```bash
python3 scripts/generate_pdf.py clients/example-com/audits/2026-05-14/report.md
# outputs report.pdf alongside the .md
```

## Project Structure

```
app/           Next.js App Router pages
components/    Shared UI components
scripts/
  run-seo-audit.ts   SEO audit pipeline entrypoint
  generate_pdf.py    Markdown → PDF via Playwright
clients/
  <slug>/            One folder per client domain
    audits/
      <date>/        Audit deliverables (see above)
```

## Development

```bash
npm run dev    # local Next.js dev server
npm run build  # production build
npm run lint   # ESLint
```

Deployed on Railway: https://verticality-production.up.railway.app
