## Sitemap Score: 4/100

**Site:** nesthub.ai (canonicalized to www.nesthub.ai)
**Audit Date:** 2026-05-14
**Platform:** WordPress on WP Engine
**Total Indexable URLs Found in Sitemap:** 0
**Total Published Pages:** 5 | **Total Published Posts:** 0

---

## Executive Summary

NestHub.ai has no functioning sitemap of any kind. More critically, every single page carries a `noindex, nofollow` meta robots tag — the site is entirely invisible to search engines. These two issues together produce near-zero SEO viability.

---

## Critical Issues

### CRITICAL-1: No Sitemap Exists — All Sitemap URLs Return 404

| URL Requested | Redirect Chain | Final Status |
|---|---|---|
| `https://nesthub.ai/sitemap.xml` | 301 → `https://www.nesthub.ai/wp-sitemap.xml` | **404** |
| `https://www.nesthub.ai/sitemap.xml` | 301 → `https://www.nesthub.ai/wp-sitemap.xml` | **404** |
| `https://www.nesthub.ai/wp-sitemap.xml` | — | **404** |
| `https://www.nesthub.ai/sitemap_index.xml` | — | **404** |
| `https://www.nesthub.ai/sitemap-index.xml` | — | **404** |
| `https://www.nesthub.ai/page-sitemap.xml` | — | **404** |

The WordPress built-in sitemap (auto-enabled since WP 5.5) appears explicitly disabled — likely via `add_filter('wp_sitemaps_enabled', '__return_false')` or a plugin. The redirect from `/sitemap.xml` → `/wp-sitemap.xml` is a misconfigured server rewrite that further compounds the issue.

**Impact:** Googlebot has no sitemap. Pages discoverable only via crawl. For a new domain with no backlinks, this means near-zero crawl coverage.

### CRITICAL-2: Sitewide noindex, nofollow on All Pages

Every page returns `<meta name='robots' content='noindex, nofollow' />`. This is almost certainly WordPress Settings → Reading → "Discourage search engines" checkbox left on from development.

**Impact:** Even if a sitemap existed, no pages would be indexed.

---

## High Issues

### HIGH-1: No Sitemap Directive in robots.txt

`robots.txt` contains only `User-agent: *`, `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php`, `Crawl-delay: 10`. No `Sitemap:` directive.

### HIGH-2: Crawl-delay: 10 in robots.txt

Google ignores `Crawl-delay` (uses GSC crawl rate instead), but Bing and others respect it. This leftover setting signals misconfiguration.

### HIGH-3: Broken Redirect Chain on Sitemap Path

Non-WWW → WWW redirect also rewrites `/sitemap.xml` to `/wp-sitemap.xml`, creating a broken path even if `/sitemap.xml` were later created.

---

## Medium Issues

### MEDIUM-1: Only 5 Pages, 0 Posts on Entire Site

Published pages: Homepage, About, Join Waitlist, Terms of Use, Terms & Conditions. No blog, no feature pages, no pricing, no use-case landing pages.

### MEDIUM-2: No Content Strategy

Zero blog posts. A SaaS tool in real estate tech requires topical content to rank for any organic queries.

---

## Coverage Summary Table

| Check | Result |
|---|---|
| /sitemap.xml accessible | ❌ 404 (after redirect) |
| /wp-sitemap.xml accessible | ❌ 404 |
| robots.txt Sitemap directive | ❌ Missing |
| Pages with noindex | ❌ 5/5 (100%) |
| Total indexable pages | ❌ 0 |
| Sitemap coverage | ❌ 0% |

---

## Required Actions (Priority Order)

1. **Remove sitewide noindex** — WordPress Admin > Settings > Reading, uncheck "Discourage search engines"
2. **Re-enable WordPress sitemap** — Remove `wp_sitemaps_enabled` filter or plugin override
3. **Fix sitemap redirect rule** — `/sitemap.xml` should redirect to `https://www.nesthub.ai/sitemap.xml` (same path), not to `/wp-sitemap.xml`
4. **Add Sitemap directive to robots.txt** — `Sitemap: https://www.nesthub.ai/wp-sitemap.xml`
5. **Submit to Google Search Console and Bing Webmaster Tools** after steps 1–4

---

## Minimal Sitemap Template (For Launch)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.nesthub.ai/</loc>
    <lastmod>2025-12-11</lastmod>
  </url>
  <url>
    <loc>https://www.nesthub.ai/about-us/</loc>
    <lastmod>2025-07-09</lastmod>
  </url>
  <url>
    <loc>https://www.nesthub.ai/join-waitlist/</loc>
    <lastmod>2025-07-09</lastmod>
  </url>
</urlset>
```
