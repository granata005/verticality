#!/usr/bin/env python3
"""
Convert a markdown SEO audit report to a client-ready PDF.

Uses Playwright (Chromium) to render styled HTML → PDF.
Requires: pip install playwright markdown
          playwright install chromium

Usage:
    python3 scripts/generate_pdf.py report.md report.pdf
    python3 scripts/generate_pdf.py report.md            # outputs report.pdf alongside input
"""

import sys
import re
import os
from pathlib import Path
from datetime import date

try:
    import markdown
except ImportError:
    print("Error: markdown package required. Install with: pip install markdown", file=sys.stderr)
    sys.exit(1)

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright required. Install with: pip install playwright && playwright install chromium", file=sys.stderr)
    sys.exit(1)


# ── Styles ────────────────────────────────────────────────────────────────────

CSS = """
:root {
  --brand:   #1e3a5f;
  --accent:  #c9a227;
  --good:    #2d6a4f;
  --warn:    #d4740e;
  --danger:  #c53030;
  --bg:      #faf9f7;
  --border:  #d6d3cc;
  --text:    #1a1a2e;
  --muted:   #6b7280;
  font-size: 11pt;
}

@page {
  size: A4;
  margin: 20mm 22mm;
  @top-center  { content: "SEO Audit Report — Verticality"; font-size: 9pt; color: var(--muted); }
  @bottom-right { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; color: var(--muted); }
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--text);
  background: #fff;
  line-height: 1.6;
  margin: 0;
}

/* Cover page */
.cover {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 0;
  border-bottom: 3px solid var(--brand);
  margin-bottom: 60px;
  page-break-after: always;
}
.cover-badge {
  background: var(--brand);
  color: #fff;
  font-size: 9pt;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding: 4px 14px;
  border-radius: 2px;
  margin-bottom: 24px;
  display: inline-block;
}
.cover h1 {
  font-size: 32pt;
  color: var(--brand);
  margin: 0 0 8px;
  font-weight: 700;
  line-height: 1.15;
}
.cover .domain {
  font-size: 15pt;
  color: var(--muted);
  margin-bottom: 32px;
}
.cover .meta {
  font-size: 10pt;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 16px;
  width: 100%;
}
.cover .meta span { margin-right: 20px; }

/* Headings */
h1, h2, h3, h4 { color: var(--brand); font-weight: 600; margin-top: 1.8em; }
h1 { font-size: 20pt; border-bottom: 2px solid var(--brand); padding-bottom: 6px; }
h2 { font-size: 15pt; border-bottom: 1px solid var(--border); padding-bottom: 4px; }
h3 { font-size: 12pt; }
h4 { font-size: 11pt; color: var(--muted); }

/* Body text */
p { margin: .6em 0; }
a { color: var(--brand); }

/* Tables */
table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.2em 0;
  font-size: 10pt;
  page-break-inside: avoid;
}
thead { background: var(--brand); color: #fff; }
thead th { padding: 7px 10px; text-align: left; font-weight: 600; }
tbody tr:nth-child(even) { background: #f4f3f1; }
td { padding: 6px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }

/* Code */
code {
  background: #f0ede8;
  border: 1px solid var(--border);
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 9.5pt;
  padding: 1px 5px;
}
pre code {
  display: block;
  padding: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
}

/* Lists */
ul, ol { padding-left: 1.4em; margin: .5em 0; }
li { margin: .25em 0; }

/* Priority badges */
.badge {
  display: inline-block;
  font-size: 8.5pt;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.badge-critical { background: #fee2e2; color: var(--danger); border: 1px solid var(--danger); }
.badge-high     { background: #fff3cd; color: var(--warn);   border: 1px solid var(--warn); }
.badge-medium   { background: #e0f2fe; color: #0369a1;       border: 1px solid #0369a1; }
.badge-low      { background: #f0fdf4; color: var(--good);   border: 1px solid var(--good); }

/* Score box */
.score-box {
  display: inline-block;
  width: 56px; height: 56px;
  border-radius: 50%;
  text-align: center;
  line-height: 56px;
  font-size: 18pt;
  font-weight: 700;
  color: #fff;
  margin: 0 8px 8px 0;
  vertical-align: middle;
}
.score-good    { background: var(--good); }
.score-average { background: var(--warn); }
.score-poor    { background: var(--danger); }

/* Blockquotes (used for callouts) */
blockquote {
  border-left: 4px solid var(--accent);
  background: #fffbf0;
  padding: 10px 16px;
  margin: 1em 0;
  font-style: normal;
}

/* Page break helpers */
.page-break { page-break-after: always; }
h2 { page-break-before: auto; }

/* Footer watermark */
.watermark {
  margin-top: 40px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  font-size: 9pt;
  color: var(--muted);
  text-align: center;
}
"""


def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def extract_domain(md_text: str) -> str:
    """Try to pull a domain name from the first 400 chars of the report."""
    patterns = [
        r'#+\s+.*?(?:SEO Audit|Audit Report)[^\n]*?(?:for|:)\s+([a-zA-Z0-9.-]+\.[a-z]{2,})',
        r'Domain:\s*\*?\*?([a-zA-Z0-9.-]+\.[a-z]{2,})',
        r'(?:auditing|audit for|website:)\s+([a-zA-Z0-9.-]+\.[a-z]{2,})',
        r'https?://([a-zA-Z0-9.-]+\.[a-z]{2,})',
    ]
    snippet = md_text[:600]
    for pat in patterns:
        m = re.search(pat, snippet, re.IGNORECASE)
        if m:
            return m.group(1).lower()
    return "domain"


def md_to_content_html(md_text: str) -> str:
    """Convert markdown to HTML fragment with badge styling."""
    # Checkbox symbols
    md_text = md_text.replace("- [ ]", "- &#9744;")
    md_text = md_text.replace("- [x]", "- &#9745;")

    content = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "toc", "nl2br"],
    )

    # Priority badges
    for label, css in [("Critical", "critical"), ("High", "high"), ("Medium", "medium"), ("Low", "low")]:
        content = re.sub(
            rf'<strong>({label})</strong>',
            rf'<strong class="badge badge-{css}">\1</strong>',
            content,
        )

    return content


def build_full_html(md_path: str, content_html: str, domain: str) -> str:
    report_date = date.today().strftime("%B %d, %Y")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SEO Audit — {domain}</title>
  <style>{CSS}</style>
</head>
<body>

  <div class="cover">
    <div class="cover-badge">SEO Audit Report</div>
    <h1>{domain}</h1>
    <div class="domain">{domain}</div>
    <div class="meta">
      <span>Prepared by Verticality</span>
      <span>{report_date}</span>
    </div>
  </div>

  {content_html}

  <div class="watermark">
    Prepared by <strong>Verticality</strong> · hello@verticality.agency ·
    Generated {report_date} · Confidential
  </div>

</body>
</html>"""


def generate_pdf(md_path: str, pdf_path: str) -> None:
    md_text = Path(md_path).read_text(encoding="utf-8")
    domain = extract_domain(md_text)
    content_html = md_to_content_html(md_text)
    full_html = build_full_html(md_path, content_html, domain)

    # Write temp HTML (for debugging / fallback)
    html_path = Path(pdf_path).with_suffix(".html")
    html_path.write_text(full_html, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(full_html, wait_until="networkidle")
        page.pdf(
            path=str(pdf_path),
            format="A4",
            margin={"top": "20mm", "bottom": "20mm", "left": "22mm", "right": "22mm"},
            print_background=True,
        )
        browser.close()

    size_kb = Path(pdf_path).stat().st_size // 1024
    print(f"PDF saved: {pdf_path} ({size_kb} KB)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_md = sys.argv[1]
    output_pdf = sys.argv[2] if len(sys.argv) > 2 else str(Path(input_md).with_suffix(".pdf"))

    if not os.path.exists(input_md):
        print(f"Error: input file not found: {input_md}", file=sys.stderr)
        sys.exit(1)

    generate_pdf(input_md, output_pdf)
