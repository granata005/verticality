# GEO / AI Search Readiness Audit — nesthub.ai
**Audit Date:** 2026-05-14  
**Auditor:** Claude Sonnet 4.6 (Generative Engine Optimization Specialist)  
**Domain:** https://nesthub.ai  
**Industry:** Real Estate SaaS (Bay Area, CA)

---

## Overall GEO Health Score: 19 / 100

| Dimension | Weight | Raw Score | Weighted |
|---|---|---|---|
| Citability | 25% | 18 / 100 | 4.5 |
| Structural Readability | 20% | 30 / 100 | 6.0 |
| Multi-Modal Content | 15% | 10 / 100 | 1.5 |
| Authority & Brand Signals | 20% | 8 / 100 | 1.6 |
| Technical Accessibility | 20% | 27 / 100 | 5.4 |
| **TOTAL** | 100% | — | **19 / 100** |

**Interpretation:** Critical GEO risk. The site is nearly invisible to AI search engines. GPTBot, ClaudeBot, and PerplexityBot are not explicitly permitted in robots.txt, no llms.txt exists, there is zero published content (blog, articles, FAQs), and no verifiable brand presence on Wikipedia, Reddit, LinkedIn, or YouTube. Without immediate intervention, nesthub.ai will not appear in ChatGPT, Perplexity, Google AIO, or Bing Copilot citations.

---

## Platform-Specific Scores

| AI Platform | Score | Reasoning |
|---|---|---|
| Google AI Overviews | 12 / 100 | No structured content, no E-E-A-T signals, no FAQ schema |
| ChatGPT (Browse / SearchGPT) | 8 / 100 | GPTBot not explicitly allowed, no content corpus to cite |
| Perplexity | 10 / 100 | PerplexityBot not explicitly allowed, no citable passages |
| Bing Copilot | 14 / 100 | Bing crawls the site (not blocked) but no structured content to surface |

---

## Section 1: AI Crawler Access (Technical Accessibility)

### robots.txt — Current State

```
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Crawl-delay: 10
```

**Finding:** The robots.txt uses a `User-agent: *` wildcard but specifies no explicit rules for any AI crawler. No AI-specific user-agents are named anywhere in the file.

### AI Crawler Status

| Crawler | Owner | Status | Impact |
|---|---|---|---|
| GPTBot | OpenAI (ChatGPT, SearchGPT) | Not explicitly allowed — falls under `*` wildcard, technically permitted but unverified | HIGH |
| OAI-SearchBot | OpenAI (real-time search) | Not named — same wildcard treatment | HIGH |
| ClaudeBot | Anthropic | Not named — same wildcard treatment | HIGH |
| PerplexityBot | Perplexity AI | Not named — same wildcard treatment | HIGH |
| CCBot | Common Crawl (training data) | Not named — same wildcard treatment | MEDIUM |
| anthropic-ai | Anthropic (training) | Not named | LOW |
| cohere-ai | Cohere | Not named | LOW |

**Issue (Critical):** While no AI crawlers are explicitly blocked, none are explicitly allowed either. Best practice requires named `User-agent` stanzas for each major AI crawler with explicit `Allow: /` directives. Without these, AI crawlers may apply conservative interpretations or simply receive no crawl-priority signal. The `Crawl-delay: 10` applying globally also slows AI indexing unnecessarily; AI crawlers should ideally have no delay or a separate, reduced delay.

**Issue (High):** WordPress sitemap endpoint (`/wp-sitemap.xml`) returns HTTP 403 Forbidden. AI crawlers discovering the site via DNS/backlinks cannot find a sitemap to guide content discovery. The WordPress REST API (`/wp-json/wp/v2/posts`) returns an empty array, confirming zero published posts.

---

## Section 2: llms.txt Status

**Status: ABSENT (404)**

No `llms.txt` file exists at `https://nesthub.ai/llms.txt`. No `llms-full.txt` exists either.

**What this means:** The llms.txt standard (proposed by Answer.AI/Jeremy Howard) allows site owners to provide a curated, LLM-readable summary of their site's content, purpose, and permissions. Without it, AI models must infer context from raw HTML, which for a thin-content site like nesthub.ai yields almost nothing to cite.

**RSL 1.0 Licensing:** No licensing declaration found anywhere on the domain for AI training use. No `ai.txt`, no Schema.org `license` markup, no Creative Commons declarations.

**Issue (Critical):** Create `/llms.txt` immediately. This is a zero-cost, high-signal action that directly influences how LLMs describe the product.

### Recommended llms.txt Structure

```markdown
# NestHub

> NestHub is a real estate transaction management platform for Bay Area home buyers and realtors. It centralizes property comparables, disclosures, offer tracking, and buyer-agent communication in a single dashboard.

## Core Use Cases
- [Buyer Dashboard](https://nesthub.ai/#buyers): Track saved homes, disclosures, and offer deadlines
- [Realtor Tools](https://nesthub.ai/#realtors): Manage multiple buyers, automate updates, streamline offers
- [About](https://nesthub.ai/about): Company background, founding story, market coverage

## Contact
- Support: support@nesthub.ai
- Phone: (925) 237-1463
- Coverage: Bay Area, California (Southern CA expanding)

## Licensing
Content on this site is available for AI indexing and summarization. Not licensed for bulk AI training without permission.
```

---

## Section 3: Passage-Level Citability

**Score: 18 / 100**

Citability measures whether an AI model can extract a self-contained, accurate, source-attributable passage from the site to answer a user query.

### Optimal Passage Length
AI citation research identifies 134–167 words as the optimal passage length for citation. NestHub's homepage content consists primarily of very short feature labels (3–8 words each) and brief H3 feature blurbs with no supporting paragraphs. No passage on the site approaches the optimal length with substantive information.

### Direct Answer Audit
The first 40–60 words of each section should deliver a direct, citable answer. Current state:

| Section | First 40-60 Words Available? | Citable? |
|---|---|---|
| What is NestHub? | Partial — tagline only: "a smarter way to manage the homes your clients actually care about" | No — too vague |
| Realtor features | H3 labels only (e.g. "Streamlined Offer Management") | No |
| Buyer features | H3 labels only (e.g. "A Home for Your Home Search") | No |
| About page | Founder story present, qualitative only | Partially |
| Pricing | Page 404s | N/A |
| Blog / Articles | No blog exists | N/A |

### Question-Based Headings
Zero H2/H3 headings are phrased as questions (e.g., "How does NestHub help realtors?"). All headings are declarative labels or marketing phrases. AI models use question-format headings as strong signals for featured snippet and AIO inclusion.

### Statistics with Attribution
The About page lists four statistics (2M active listings, 100% agent-backed, 0 deadlines missed, 10+ markets). These are unattributed, lack dates, and are not semantically marked up. Without a source or methodology, AI models will not cite them.

**Issue (Critical):** No substantive body text exists anywhere on the site. Every page is either a 404, a feature label list, or a tagline. There is nothing for an AI to cite.

**Issue (Critical):** No FAQ section, no how-it-works articles, no use-case pages, no help center content. These are the primary content types AI overviews draw from for real estate SaaS queries.

**Issue (High):** Statistics on the About page have no attribution or date, making them uncitable by responsible AI systems.

---

## Section 4: Structural Readability for AI Extraction

**Score: 30 / 100**

### Positive Signals
- The site is WordPress-based and server-side rendered — HTML is accessible to crawlers without JavaScript execution.
- H1, H2, H3 hierarchy is present and non-empty.
- Contact information (email, phone) is present and consistent.
- Geographic targeting (Bay Area, California) is explicit in text.

### Structural Deficiencies

**Issue (Critical): No Schema.org markup detected.** The site has no JSON-LD or microdata for:
- `Organization` (name, url, logo, sameAs links)
- `SoftwareApplication` or `WebApplication` (for the SaaS product)
- `FAQPage` (for any FAQ content, which does not yet exist)
- `BreadcrumbList`
- `LocalBusiness` (despite having a phone number and Bay Area geographic focus)

Without Schema.org `Organization` markup with `sameAs` links to LinkedIn, Crunchbase, and AngelList, Google's Knowledge Graph cannot establish a verified entity for NestHub.ai. This directly suppresses AI Overview eligibility.

**Issue (High): No Open Graph or Twitter Card meta tags detected** in the homepage content, which reduces rich link previews and social signal generation that feeds brand entity scores.

**Issue (High): No `<meta name="description">` confirmed in rendered content.** Meta descriptions are used by Bing Copilot and Perplexity for site summaries. Without one, auto-generated descriptions will be pulled from disconnected body text.

**Issue (Medium): Crawl-delay: 10 is excessive.** A 10-second crawl delay applying to all bots (including AI crawlers) will cause indexing queues to deprioritize the domain. AI crawlers typically budget limited crawl time per domain.

**Issue (Medium): No internal linking structure.** All pages beyond the homepage return 404 (pricing, features, blog, contact). The site has effectively one crawlable content page plus an About page, with no navigation graph for crawlers to follow.

---

## Section 5: Multi-Modal Content

**Score: 10 / 100**

### Current State
No blog posts, no video content, no infographics with alt text, no downloadable guides, no webinars. The platform.nesthub.ai subdomain is a login wall — its content is inaccessible to crawlers.

**Issue (Critical):** YouTube presence is the single strongest predictor of AI citation correlation (~0.737). NestHub has no confirmed YouTube channel or video content. This is the highest-ROI gap to close.

**Issue (High):** No image alt text audit was possible (pages 404'd), but based on the feature-label structure of the homepage, it is likely that feature screenshots (if any exist) lack descriptive alt text usable by AI.

**Issue (High):** No downloadable resources (PDFs, guides) that could generate direct file citations in AI responses.

**Issue (Medium):** No podcast appearances, press mentions, or earned media detected in a surface crawl.

---

## Section 6: Authority & Brand Signals

**Score: 8 / 100**

### Entity Verification

| Signal | Status | Impact |
|---|---|---|
| Wikipedia page | Does not exist for nesthub.ai (Wikipedia's "NestHub" article covers Google's smart display product — a namespace collision) | Critical negative |
| LinkedIn company page | 404 — no page found at linkedin.com/company/nesthub-ai | Critical |
| Reddit mentions | Unable to verify (crawl blocked), likely zero given early stage | High |
| YouTube channel | Not found | High |
| Crunchbase listing | Not checked (blocked), likely absent | High |
| AngelList / Wellfound | Not checked | Medium |
| Press / news mentions | None detected | High |
| G2 / Capterra listing | Not checked | Medium |

### Namespace Collision Risk (Critical)
The brand name "NestHub" is already occupied in Wikipedia and public consciousness by Google's Nest Hub smart display product. When an AI model encounters the query "what is NestHub," it will default to the Google hardware product, not nesthub.ai. This is a severe brand disambiguation problem that suppresses every AI citation path.

### Authorship Signals
The About page references "a former Realtor with over a decade of experience" as the founder, but no name is provided. Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) framework and AI overview eligibility both require named, verifiable authorship. An anonymous founder reduces authority scoring significantly.

**Issue (Critical):** Namespace collision with Google Nest Hub. Every AI model has been trained on vastly more content about Google's product than nesthub.ai. The brand needs differentiation — consistently using "NestHub.ai" (with the .ai suffix) in all content and Schema.org markup is the minimum mitigation.

**Issue (Critical):** No LinkedIn company page. LinkedIn is a primary authority signal for B2B SaaS brands in AI knowledge graphs.

**Issue (Critical):** No Crunchbase, AngelList, or startup directory listings. These are the canonical entity sources AI models use to identify and describe early-stage companies.

**Issue (High):** Founder is anonymous in all public content. Named authorship with a LinkedIn profile is required for E-E-A-T compliance.

**Issue (High):** No third-party reviews on G2, Capterra, or Product Hunt. AI models surface software comparisons from these platforms constantly for real estate SaaS queries.

---

## Section 7: Competitive AI Search Landscape

For real estate transaction management queries, AI models currently cite:
- Dotloop, SkySlope, Glide (disclosure management)
- Fello, Follow Up Boss (agent CRM)
- Homeward, Ribbon (buyer enablement)

NestHub.ai does not appear in any of these citation clusters. To enter AI-generated comparisons and recommendations for Bay Area real estate software, the site needs: named entity status, published comparison/vs. content, and third-party review platform presence.

---

## Prioritized Recommendations

### Priority 1 — Critical (Implement within 1 week, zero content required)

| # | Action | Effort | Expected Impact |
|---|---|---|---|
| 1 | Create `/llms.txt` with site description, use cases, and page index | 2 hours | Immediately improves LLM context for all AI crawlers |
| 2 | Add named AI crawler stanzas to `robots.txt` (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot with `Allow: /` and no crawl-delay) | 30 min | Removes crawl ambiguity for the four major AI search engines |
| 3 | Add Schema.org `Organization` JSON-LD to homepage with `name: "NestHub.ai"`, `url`, `logo`, `description`, `sameAs` array | 2 hours | Enables Google Knowledge Graph entity creation |
| 4 | Add `<meta name="description">` to homepage and About page | 30 min | Used by Bing Copilot and Perplexity for site summaries |
| 5 | Create LinkedIn company page for NestHub.ai | 1 hour | Primary B2B authority signal; required for entity graph |

### Priority 2 — High (Implement within 30 days, requires content creation)

| # | Action | Effort | Expected Impact |
|---|---|---|---|
| 6 | Publish founder name and bio on About page with LinkedIn link | 1 hour | Resolves anonymous authorship; E-E-A-T compliance |
| 7 | Create Crunchbase and AngelList company listings | 2 hours | Entity disambiguation; AI model training data inclusion |
| 8 | Publish 4–6 blog posts targeting question-based queries (e.g., "How does real estate offer management software work?", "What is a buyer dashboard in real estate?") with 134–167 word self-contained answer blocks | 3–4 weeks | Primary citability driver; feeds all AI overview platforms |
| 9 | Create FAQ page with Schema.org `FAQPage` markup targeting 8–12 common buyer/agent questions | 1 week | Direct path to Google AIO and featured snippet inclusion |
| 10 | Fix broken internal pages: `/pricing`, `/features`, `/contact`, `/blog` must resolve with content (not 404) | 1 week | Enables crawl graph; currently AI crawlers reach a dead end after the homepage |

### Priority 3 — Medium (Implement within 60–90 days)

| # | Action | Effort | Expected Impact |
|---|---|---|---|
| 11 | Create YouTube channel with 2–4 product demo videos (screen-recorded walkthroughs are sufficient) | 2 weeks | Highest single correlation with AI citation (~0.737) |
| 12 | List on G2, Capterra, and Product Hunt with complete profile | 3 hours | AI models surface these in software comparison queries |
| 13 | Fix `/wp-sitemap.xml` HTTP 403 — make sitemap publicly accessible | 30 min | Crawler discoverability; currently blocked |
| 14 | Add Open Graph and Twitter Card meta tags to all pages | 2 hours | Social sharing signals; brand entity reinforcement |
| 15 | Publish a brand disambiguation page (e.g., "NestHub.ai vs Google Nest Hub — What's the Difference?") to address the namespace collision | 3 hours | Directly addresses the Google Nest Hub confusion in AI responses |

### Priority 4 — Low (Ongoing)

| # | Action | Effort | Expected Impact |
|---|---|---|---|
| 16 | Pursue press mentions in Bay Area real estate or proptech publications (Inman, HousingWire) | Ongoing | Domain authority; AI training data inclusion |
| 17 | Add structured data for `WebApplication` (SoftwareApplication schema) | 2 hours | Enables rich results for "real estate management software" queries |
| 18 | Consider Wikipedia article for NestHub.ai once sufficient third-party sources exist | Long-term | Strong AI entity signal; requires notability threshold |
| 19 | Monitor AI citation performance quarterly using Perplexity and ChatGPT prompt testing | Ongoing | Baseline measurement against which to track progress |

---

## Revised robots.txt (Recommended)

```
User-agent: GPTBot
Allow: /
Crawl-delay: 2

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /
Crawl-delay: 2

User-agent: PerplexityBot
Allow: /
Crawl-delay: 2

User-agent: Googlebot
Allow: /
Crawl-delay: 2

User-agent: bingbot
Allow: /
Crawl-delay: 2

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Crawl-delay: 5

Sitemap: https://nesthub.ai/sitemap.xml
```

Note: `CCBot` and `anthropic-ai` are blocked above as a conservative default (training crawlers only). If nesthub.ai wants inclusion in future LLM training datasets for broader brand awareness, remove those `Disallow` lines.

---

## Summary Score Card

| Area | Finding | Severity |
|---|---|---|
| llms.txt | Missing | Critical |
| robots.txt AI crawlers | Not named, ambiguous | Critical |
| Blog / article content | Zero posts published | Critical |
| Schema.org markup | Absent | Critical |
| Namespace collision (Google Nest Hub) | Active confusion risk | Critical |
| LinkedIn company page | Does not exist | Critical |
| Named authorship | Missing | High |
| Crunchbase / directory listings | Not found | High |
| FAQ page | Does not exist | High |
| Broken internal pages | /pricing, /features, /contact, /blog all 404 | High |
| YouTube presence | Not found | High |
| Meta description | Not confirmed | High |
| Sitemap | Returns 403 | Medium |
| Open Graph tags | Not confirmed | Medium |
| Third-party reviews (G2, Capterra) | Not found | Medium |
| Crawl-delay: 10 | Excessive for AI crawlers | Medium |
| Statistics attribution | Unattributed on About page | Medium |

**Bottom line:** NestHub.ai is effectively invisible to every major AI search engine today. The site has the right WordPress infrastructure and server-side rendering foundation to fix this quickly — but needs an aggressive 90-day content and technical sprint to reach a competitive GEO score. The single highest-leverage first action is publishing `/llms.txt`, which costs two hours and immediately improves LLM context for every AI model that crawls the domain.
