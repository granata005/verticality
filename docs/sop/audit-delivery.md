# SOP: Audit Delivery (Client Onboarding → Deliverable → Handoff)

**Audience:** Any Verticality engineer or specialist running a client engagement.  
**Goal:** One person, zero tribal knowledge, one engagement end-to-end.  
**Updated:** 2026-05-14

---

## Table of Contents

1. [Phase 1 — Client Intake](#phase-1--client-intake)
2. [Phase 2 — Slug Convention](#phase-2--slug-convention)
3. [Phase 3 — SEO Audit Pipeline](#phase-3--seo-audit-pipeline)
4. [Phase 4 — Ads Audit Pipeline](#phase-4--ads-audit-pipeline)
5. [Phase 5 — Specialist Review](#phase-5--specialist-review)
6. [Phase 6 — Portal Upload](#phase-6--portal-upload)
7. [Phase 7 — Client Notification](#phase-7--client-notification)
8. [Worked Example: nesthub.ai](#worked-example-nesthubaif)
9. [Troubleshooting](#troubleshooting)

---

## Phase 1 — Client Intake

Before running anything, collect the following from the CEO or sales handoff:

| Field | Required | Notes |
|-------|----------|-------|
| Client name | ✅ | E.g. "NestHub AI" |
| Primary domain | ✅ | E.g. `nesthub.ai` — no trailing slash, no `https://` |
| Audit scope | ✅ | `seo`, `ads`, or `both` |
| Google Ads account ID | ⚠️ Ads only | Optional for inspection-mode; needed for privileged access |
| Meta Ads account ID | ⚠️ Ads only | Same as above |
| Point of contact (name + email) | ✅ | Who receives the final report |
| Delivery deadline | ✅ | Agree before starting |

**No intake = no start.** If any required field is missing, message the CEO and wait.

---

## Phase 2 — Slug Convention

Every client gets a stable directory slug derived from their primary domain:

| Rule | Example |
|------|---------|
| Lowercase domain, strip `www.` | `nesthub.ai` |
| Replace dots and special chars with hyphens | `nesthub-ai` |
| Keep it short — domain without TLD if unambiguous | `nesthub-ai` (preferred over `nesthubai`) |

The slug becomes the top-level key under `clients/`:

```
clients/
  nesthub-ai/
    audits/
      2026-05-14/
        report.md
        action-plan.md
        report.pdf
        raw/
```

**Choose the slug once and never change it.** All future audits for the same client go under the same slug, differentiated only by date.

---

## Phase 3 — SEO Audit Pipeline

### Prerequisites (one-time setup)

```bash
# In the repo root
npm install
pip install markdown playwright
playwright install chromium
```

Confirm `ANTHROPIC_API_KEY` is set in your shell (or `.env.local`).

### Run

```bash
npx tsx scripts/run-seo-audit.ts --domain <domain> --client "<Client Name>"
```

Example:

```bash
npx tsx scripts/run-seo-audit.ts --domain nesthub.ai --client "NestHub AI"
```

**Typical runtime: 10–25 minutes.** The script spawns Claude with the `seo-audit` skill, which drives the following sub-agents in parallel:

- `seo-technical` — crawlability, indexability, redirects, security headers
- `seo-content` — E-E-A-T, thin content, readability
- `seo-page` — titles, metas, headings, internal links
- `seo-schema` — structured data validation
- `seo-performance` — Core Web Vitals (CrUX field data)
- `seo-geo` — AI search readiness, llms.txt, citation pass
- `seo-images` — alt text, formats, compression

### Output

```
clients/<slug>/audits/<YYYY-MM-DD>/
  report.md        ← full audit findings with per-section scores
  action-plan.md   ← prioritized recommendations (Critical → High → Medium → Low)
  report.pdf       ← client-ready A4 PDF (Verticality branding)
  raw/             ← raw subagent outputs (section .md files, screenshots)
```

### Verify

Open `report.md` and confirm:

- [ ] Overall SEO Health Score is present (0–100)
- [ ] All 7 sections appear with individual scores
- [ ] Action plan has at least one item
- [ ] PDF renders without errors (open it)

---

## Phase 4 — Ads Audit Pipeline

### Prerequisites

Same as Phase 3. Additionally:

- `ANTHROPIC_API_KEY` (preferred) or `GEMINI_API_KEY` must be set.
- For inspection-mode (no account access), no additional credentials are needed.
- For privileged access (live account data), obtain OAuth tokens from the client — defer to CEO for credential handling.

### Run

```bash
npx tsx scripts/run-ads-audit.ts <domain>
```

Example:

```bash
npx tsx scripts/run-ads-audit.ts nesthub.ai
```

The script:
1. Runs Playwright headless to collect public ad signals (pixels, tag managers, tracking).
2. Drives the `ads-audit` skill across platforms (Google Ads, Meta, LinkedIn, TikTok, Microsoft).
3. Renders outputs to the shared `clients/<slug>/audits/<YYYY-MM-DD>/ads/` tree.

### Output

```
clients/<slug>/audits/<YYYY-MM-DD>/ads/
  ADS-AUDIT-REPORT.md    ← platform-by-platform findings
  ADS-ACTION-PLAN.md     ← prioritized ad recommendations
  ADS-QUICK-WINS.md      ← wins achievable in <30 days
  report.pdf             ← client-ready PDF (shared renderer)
```

### Verify

Open `ADS-AUDIT-REPORT.md` and confirm:

- [ ] Signal detection section lists detected vs. not-detected platforms
- [ ] At least one platform section has findings
- [ ] `ADS-QUICK-WINS.md` exists and has actionable items
- [ ] PDF renders without errors

---

## Phase 5 — Specialist Review

**Who reviews:** CEO (until we have a dedicated SEO/Ads specialist on staff).

**Review checklist:**

### SEO report

- [ ] Top critical findings match observable site reality (spot-check 2–3)
- [ ] Score feels calibrated (not inflated or deflated vs. actual site quality)
- [ ] No hallucinated URLs, metrics, or competitor data
- [ ] Action plan priorities make sense for the client's situation
- [ ] Client-appropriate tone (no internal jargon in the PDF)

### Ads report

- [ ] Detected platforms match what the client's site actually uses
- [ ] Platform findings are grounded in real observable signals
- [ ] Quick wins are genuinely quick (no "rebuild your funnel" in quick wins)
- [ ] No made-up account stats in inspection mode — only signal-based inferences

**If changes are needed:** edit `report.md` / `ADS-AUDIT-REPORT.md` directly and re-run PDF generation:

```bash
python3 scripts/generate_pdf.py clients/<slug>/audits/<date>/report.md
# or for ads:
python3 scripts/generate_pdf.py clients/<slug>/audits/<date>/ads/ADS-AUDIT-REPORT.md
```

**Do not send unreviewed reports to clients.**

---

## Phase 6 — Portal Upload

> Client portal is scoped to a future ticket. Until it ships, use this manual path.

1. Locate the deliverable folder: `clients/<slug>/audits/<YYYY-MM-DD>/`
2. Upload the following files to the shared delivery folder (Google Drive or equivalent — confirm with CEO for current location):
   - `report.pdf` (SEO)
   - `ads/report.pdf` (Ads, if in scope)
   - `action-plan.md` or `ADS-QUICK-WINS.md` as a supplementary reference
3. Set link sharing to "anyone with the link can view" unless the client requested restricted access.
4. Copy the shareable link — you'll need it in the next step.

---

## Phase 7 — Client Notification

Send the delivery email or message **after** portal upload is confirmed.

Template (adapt tone to client relationship):

> Hi [Name],
>
> Your [SEO / Ads / full] audit for [domain] is ready.
>
> **Report:** [link to PDF]  
> **Action Plan:** [link to action plan]
>
> Top priority finding: [one sentence summary of the #1 critical finding].
>
> Happy to walk through the findings on a call — just reply to book time.
>
> — [Your name], Verticality

**Log the delivery** — add a note in the client's Paperclip issue or project with the date sent and the shareable link.

---

## Worked Example: nesthub.ai

This is the smoke-test engagement from [VER-3](/VER/issues/VER-3).

### Intake

| Field | Value |
|-------|-------|
| Client name | NestHub AI |
| Domain | `nesthub.ai` |
| Scope | SEO |
| Point of contact | (internal smoke test — no real client) |
| Deadline | Same day |

### Slug

`nesthub-ai` (dot → hyphen)

### Pipeline run

```bash
npx tsx scripts/run-seo-audit.ts --domain nesthub.ai --client "NestHub AI"
# Runtime: ~18 minutes
# Output: clients/nesthub-ai/audits/2026-05-14/
```

### Deliverable tree

```
clients/nesthub-ai/audits/2026-05-14/
  report.md        (56 KB)
  action-plan.md   (37 KB)
  report.pdf       (876 KB)
  raw/
    FULL-AUDIT-REPORT.md
    ACTION-PLAN.md
    screenshots/
    technical.md
    content.md
    onpage.md
    schema.md
    performance.md
    geo.md
    images.md
```

### Key findings (summary)

**SEO Health Score: 24 / 100**

| Section | Score |
|---------|-------|
| Technical SEO | 29/100 |
| Content Quality | 31/100 |
| On-Page SEO | 20/100 |
| Schema | 2/100 |
| Performance (CWV) | 28/100 |
| AI Search Readiness | 19/100 |
| Images | 30/100 |

**#1 Critical finding:** Sitewide `noindex, nofollow` — WordPress "Discourage search engines" was left on from development. The site is completely invisible to Google.

**37 action items** (Critical → Low) in `action-plan.md`.

### Review notes

Spot-checked: the noindex finding is confirmed by inspecting `nesthub.ai` robots.txt and page meta. Score calibration matches the severity of findings. PDF is clean and client-appropriate.

### Hypothetical delivery

Assuming portal were live, delivery link + email would go to the client's point of contact on 2026-05-14.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Script exits immediately with `claude: command not found` | Claude CLI not installed | `npm install -g @anthropic-ai/claude-code` |
| PDF is blank or missing | Playwright/Chromium not installed | `playwright install chromium` |
| `ANTHROPIC_API_KEY not set` error | Missing env var | Add to `.env.local` or export in shell |
| Audit sections missing (< 7) | Sub-agent timeout or skill error | Re-run; check `raw/` for partial outputs |
| Score seems wrong | Spot-check raw section outputs | Edit `report.md` manually, re-generate PDF |
| Ads signals all "not detected" | Site may block headless browsers | Check manually; note in report |

---

*This SOP is a living document. Update it when the pipeline changes. If you find a step missing or wrong, fix it in the same PR.*
