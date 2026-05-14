# Schema / Structured Data Audit — nesthub.ai

**Section Score: 2 / 100**

**Audit Date:** 2026-05-14
**Pages Crawled:** Homepage (`/`), `/about-us/`, `/join-waitlist/`, `/terms-of-use/`
**CMS:** WordPress + Elementor 4.0.8
**SEO Plugin Detected:** None (no Yoast, RankMath, or AIOSEO output found)

---

## Executive Summary

NestHub.ai has **zero structured data** across all audited pages. No JSON-LD, no Microdata, and no RDFa was detected anywhere on the site. The site also has `noindex, nofollow` set sitewide, which means Google is currently not indexing the site at all — structured data will have no SEO impact until indexing is enabled. However, implementing correct schema now means it is ready the moment the robots directive is corrected.

The site is a B2B SaaS platform for real estate agents and buyers. This type of business has several high-value schema opportunities (Organization, SoftwareApplication, WebSite, Service) that are completely absent.

---

## 1. Detected Schema Inventory

| Format | Type | Page | Status |
|--------|------|-------|--------|
| JSON-LD | — | All pages | Not present |
| Microdata | — | All pages | Not present |
| RDFa | — | All pages | Not present |

**Result: No structured data detected on any page.**

---

## 2. Existing Meta / Markup Context

The following non-schema markup was observed:

- `<link rel="canonical" href="https://www.nesthub.ai/" />` — present on homepage only
- `<meta name="og:url" content="https://www.nesthub.ai/" />` — present but uses `name=` attribute instead of the correct `property=` attribute for Open Graph; technically invalid OG markup
- No `og:title`, `og:description`, `og:image`, or `og:type` tags present
- No Twitter Card meta tags present
- No `meta name="description"` present on any page
- `<meta name='robots' content='noindex, nofollow' />` — present on all pages; site is entirely blocked from indexing

---

## 3. Validation Results

### 3.1 Homepage (`https://www.nesthub.ai/`)

No schema blocks to validate.

### 3.2 About Us (`https://www.nesthub.ai/about-us/`)

No schema blocks to validate.

### 3.3 All Other Pages

No schema blocks to validate on any audited page.

---

## 4. Issues

### CRITICAL

#### C-1: Sitewide `noindex, nofollow` directive blocks all Google indexing

**Affected pages:** All pages
**Detail:** Every page on the site returns `<meta name='robots' content='noindex, nofollow' />`. This instructs Google not to index any page and not to follow any links. No structured data, no matter how correct, will generate rich results or SEO benefit while this directive is active. This is almost certainly a pre-launch setting that has not been removed.
**Fix:** Remove or replace the robots meta tag on all public pages. For pages that should be indexed, use `<meta name="robots" content="index, follow" />` or remove the tag entirely (index/follow is the default).

---

#### C-2: No structured data whatsoever on any page

**Affected pages:** All pages
**Detail:** The site has no JSON-LD, Microdata, or RDFa markup. For a SaaS platform targeting real estate professionals, this represents a complete absence of signals that help Google understand the business entity, the software product, and the service offered.
**Fix:** Implement the JSON-LD blocks detailed in Section 5 below, starting with `Organization`, `WebSite`, and `SoftwareApplication`.

---

### HIGH

#### H-1: No SEO plugin installed

**Affected pages:** All pages
**Detail:** No Yoast SEO, RankMath, or AIOSEO output is present in the page source. The site is built on WordPress with Elementor; without an SEO plugin, there is no automated mechanism for generating meta descriptions, canonical tags on interior pages, Open Graph tags, or any schema. This is the root cause of most issues in this audit.
**Fix:** Install Yoast SEO (free tier is sufficient to start) or RankMath. Configure sitewide Organization schema from the plugin settings, and set page-level meta descriptions.

#### H-2: Open Graph meta tags are malformed and incomplete

**Affected pages:** All pages
**Detail:** The only OG tag present is `<meta name="og:url" ...>`. Open Graph properties must use the `property` attribute (not `name`). The correct syntax is `<meta property="og:url" content="..." />`. Additionally, `og:title`, `og:description`, `og:image`, and `og:type` are entirely missing. Without these, social shares and messaging app link previews will display no useful information.
**Fix:** Add a complete Open Graph block to every page using the `property=` attribute:
```html
<meta property="og:type" content="website" />
<meta property="og:title" content="NestHub – Advanced Website Management Platform for Realtors" />
<meta property="og:description" content="NestHub helps Realtors and buyers stay organized, track homes, manage offers, and access documents — streamlining every transaction from first showing to final signature." />
<meta property="og:url" content="https://www.nesthub.ai/" />
<meta property="og:image" content="https://www.nesthub.ai/PATH-TO-OG-IMAGE.jpg" />
<meta property="og:site_name" content="NestHub" />
```

#### H-3: No `meta name="description"` on any page

**Affected pages:** All pages
**Detail:** No meta description tag is present on the homepage or any audited sub-page. Meta descriptions are used as default text in SERP snippets and influence click-through rate.
**Fix:** Add unique meta descriptions to every page, 120–160 characters.

---

### MEDIUM

#### M-1: No `WebSite` schema with `SearchAction`

**Affected pages:** Homepage
**Detail:** `WebSite` schema with a `SearchAction` (Sitelinks Searchbox) is not implemented. This is a quick win for any WordPress site.
**Fix:** See Section 5 for the recommended JSON-LD block.

#### M-2: No `SoftwareApplication` schema for the NestHub platform

**Affected pages:** Homepage, features-type pages
**Detail:** NestHub is a software product. Google supports `SoftwareApplication` rich results including application category, operating system, and aggregate rating. None of this is implemented.
**Fix:** See Section 5 for the recommended JSON-LD block.

#### M-3: No `Organization` schema

**Affected pages:** Homepage
**Detail:** No `Organization` type is declared. This is the most fundamental schema for any business — it establishes the entity's identity (name, URL, logo, contact, social profiles) in Google's Knowledge Graph.
**Fix:** See Section 5 for the recommended JSON-LD block.

#### M-4: No canonical tags on sub-pages

**Affected pages:** `/about-us/`, `/join-waitlist/`, `/terms-of-use/`
**Detail:** Only the homepage has a canonical tag. All other pages lack canonical declarations, leaving them open to duplicate content interpretation.
**Fix:** Install an SEO plugin (see H-1) which will auto-generate self-referencing canonicals on all pages.

#### M-5: Double slash in RSS feed alternate link

**Affected pages:** Homepage
**Detail:** `<link rel="alternate" href="https://www.nesthub.ai//feed/">` contains a double slash (`//feed/`) which, while not breaking, is a minor technical defect.
**Fix:** Correct the URL to `https://www.nesthub.ai/feed/`.

---

### LOW

#### L-1: No `BreadcrumbList` schema

**Affected pages:** All interior pages
**Detail:** Interior pages lack breadcrumb markup, which enables breadcrumb display in Google search results in place of the raw URL.
**Fix:** Add `BreadcrumbList` JSON-LD to interior page templates. Most SEO plugins handle this automatically.

#### L-2: No Twitter Card meta tags

**Affected pages:** All pages
**Detail:** No `twitter:card`, `twitter:title`, `twitter:description`, or `twitter:image` tags are present.
**Fix:** Add Twitter Card meta tags alongside Open Graph tags (see H-2).

#### L-3: No `Person` schema for founder attribution

**Affected pages:** `/about-us/`
**Detail:** The About Us page describes the founder's background and mission in detail but has no `Person` schema attributing the content or establishing the founder as a named entity.
**Fix:** Add a `Person` JSON-LD block on the About Us page.

---

## 5. Recommended JSON-LD Implementations

All blocks should be placed in the `<head>` section or immediately before `</body>`. Use an SEO plugin (Yoast / RankMath) to inject these sitewide where noted, and per-page where noted.

---

### 5.1 Organization (Homepage — global)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NestHub",
  "url": "https://www.nesthub.ai/",
  "logo": "https://www.nesthub.ai/wp-content/uploads/YOUR-LOGO.png",
  "description": "NestHub is a smart, all-in-one platform that helps Realtors and buyers stay organized, track homes, manage offers, and access key documents—streamlining the journey from first showing to final signature.",
  "foundingLocation": {
    "@type": "Place",
    "name": "Bay Area, California, USA"
  },
  "areaServed": [
    {
      "@type": "Place",
      "name": "Bay Area, California"
    },
    {
      "@type": "Place",
      "name": "Southern California"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-925-237-1463",
    "contactType": "customer support",
    "email": "support@nesthub.ai"
  },
  "sameAs": []
}
```

> Note: Populate `sameAs` with any LinkedIn, Twitter/X, Facebook, or Crunchbase profile URLs. Replace logo path with the actual asset path.

---

### 5.2 WebSite with SearchAction (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NestHub",
  "url": "https://www.nesthub.ai/",
  "description": "Advanced website management platform for Realtors and homebuyers.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.nesthub.ai/?s={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

> Note: Only include the `potentialAction` if the site has a functioning search feature. Remove it if there is no search functionality.

---

### 5.3 SoftwareApplication (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NestHub",
  "url": "https://www.nesthub.ai/",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": "NestHub is a real estate transaction management platform that helps Realtors manage buyer pipelines, track homes, share disclosures, and coordinate offers from first showing to final signature.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Currently in early access. Contact for pricing."
  },
  "provider": {
    "@type": "Organization",
    "name": "NestHub",
    "url": "https://www.nesthub.ai/"
  }
}
```

> Note: Update `offers` with actual pricing once the product launches publicly. Add `aggregateRating` once reviews are collected.

---

### 5.4 Service (Homepage — describes what the platform does as a service)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Real Estate Transaction Management",
  "serviceType": "Real Estate Software Platform",
  "provider": {
    "@type": "Organization",
    "name": "NestHub",
    "url": "https://www.nesthub.ai/"
  },
  "areaServed": {
    "@type": "Place",
    "name": "California, USA"
  },
  "description": "NestHub provides Realtors with a centralized dashboard to manage buyer pipelines, track property disclosures, coordinate offers, and automate client communication throughout the home-buying process.",
  "audience": {
    "@type": "Audience",
    "audienceType": "Real Estate Agents and Buyers"
  }
}
```

---

### 5.5 Person — Founder (About Us page only)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "FOUNDER NAME",
  "jobTitle": "Founder",
  "worksFor": {
    "@type": "Organization",
    "name": "NestHub",
    "url": "https://www.nesthub.ai/"
  },
  "description": "Real estate professional with over a decade of experience working with home buyers, and the creator of NestHub.",
  "url": "https://www.nesthub.ai/about-us/"
}
```

> Note: Replace `FOUNDER NAME` with the actual founder name from the About page. Add `sameAs` LinkedIn URL if available.

---

### 5.6 BreadcrumbList (All interior pages — example for About Us)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.nesthub.ai/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About Us",
      "item": "https://www.nesthub.ai/about-us/"
    }
  ]
}
```

---

## 6. Implementation Priority Order

| Priority | Action | Impact |
|----------|--------|--------|
| 1 (Blocker) | Remove `noindex, nofollow` from all public pages | Enables Google to index the site at all |
| 2 | Install Yoast SEO or RankMath | Provides the infrastructure for all other fixes |
| 3 | Add `Organization` JSON-LD | Entity establishment in Knowledge Graph |
| 4 | Fix Open Graph tags (use `property=` attribute, add missing tags) | Social sharing, link previews |
| 5 | Add `meta name="description"` to all pages | SERP CTR |
| 6 | Add `SoftwareApplication` JSON-LD | Rich result eligibility for software |
| 7 | Add `WebSite` JSON-LD | Sitelinks Searchbox eligibility |
| 8 | Add `Service` JSON-LD | Entity context for service offering |
| 9 | Add `BreadcrumbList` to interior pages | Breadcrumb rich results |
| 10 | Add `Person` schema on About Us | Founder entity and E-E-A-T signals |

---

## 7. Scoring Breakdown

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Schema presence | 0 | 40 | No schema on any page |
| Schema validity | N/A | 20 | Nothing to validate |
| Rich result eligibility | 0 | 20 | noindex blocks all rich results |
| Open Graph / Social meta | 2 | 10 | One malformed og:url tag present |
| Canonical / Technical | 0 | 10 | Only homepage has canonical; noindex sitewide |
| **Total** | **2** | **100** | |

---

*Audit performed by static HTML analysis of crawlable pages. JavaScript-rendered schema (if any) was not evaluated as pages blocked by Cloudflare WAF for direct bot access return Cloudflare challenge pages. The homepage was accessible and confirmed zero schema. Sub-pages confirmed via direct curl with browser UA and WordPress REST API inventory.*
