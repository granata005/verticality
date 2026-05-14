# Performance & Core Web Vitals Audit — nesthub.ai

**Score: 28 / 100** (Lighthouse 13.3 Mobile, simulated throttling, 2026-05-14)

**Data source:** Lighthouse CLI 13.3 (mobile, 4G throttle: 150ms RTT, 1.6 Mbps down, 4x CPU slowdown). PageSpeed Insights API quota exhausted; no CrUX field data available for this audit run. All values below are lab measurements from a single Lighthouse run and should be validated against CrUX field data once quota resets.

---

## Core Web Vitals Summary

| Metric | Lab Value | Threshold | Status |
|--------|-----------|-----------|--------|
| LCP (Largest Contentful Paint) | 14.4 s | ≤ 2.5 s | FAIL |
| INP (Interaction to Next Paint) | Not measured (TBT proxy: 3,500 ms) | ≤ 200 ms | LIKELY FAIL |
| CLS (Cumulative Layout Shift) | 0 | ≤ 0.1 | PASS |
| FCP (First Contentful Paint) | 4.6 s | ≤ 1.8 s | FAIL |
| TTI (Time to Interactive) | 14.4 s | ≤ 3.8 s | FAIL |
| Speed Index | 7.7 s | ≤ 3.4 s | FAIL |
| TBT (Total Blocking Time) | 3,500 ms | ≤ 200 ms | FAIL |
| TTFB (Server Response Time) | 20 ms | ≤ 200 ms | PASS |

> CLS passes (0) but LCP and INP are catastrophically bad. TTFB is excellent at 20 ms (Cloudflare edge + WP Engine caching), meaning the performance problems are entirely front-end.

---

## Other Lighthouse Category Scores

| Category | Score |
|----------|-------|
| Performance | **28 / 100** |
| Accessibility | 89 / 100 |
| Best Practices | 77 / 100 |
| SEO | **61 / 100** |

---

## Issues by Severity

### Critical

#### 1. LCP Element Has No Fetchpriority and Is Not Discoverable in Initial HTML

The LCP element is a CSS background `<div>` (`section.elementor-section > div.elementor-container > div.elementor-column > div.elementor-widget-wrap`) containing a 1.27 MB JPEG (`/wp-content/uploads/2025/06/1225.jpg`). Lighthouse reports:

- `fetchpriority=high` not applied
- Request not discoverable in initial document (image is a CSS background, browser cannot preload it)
- LCP: **14.4 s** (threshold: 2.5 s)

Estimated savings from fixing image delivery alone: **944 KiB**.

**Fix:** Convert the hero background from CSS `background-image` to an `<img>` tag with `fetchpriority="high"` and add a `<link rel="preload">` in `<head>`. Then compress and convert to WebP/AVIF.

---

#### 2. Hero Image Is 1.27 MB JPEG — No Modern Format, No Compression

`/wp-content/uploads/2025/06/1225.jpg` is **1,300.9 KB** on the wire. Lighthouse estimates **887 KB savings** by converting to WebP/AVIF at equivalent quality. This single image accounts for 59% of total page weight and is the LCP element, making it the single most impactful fix on the site.

**Fix:** Re-export as WebP (quality 80) or AVIF. Target under 100 KB. Enable WordPress automatic WebP generation (Imagify, ShortPixel, or native WP 6.1+ WebP support). Set `<img srcset>` with responsive sizes.

---

#### 3. Render-Blocking Resources — 2,550 ms Estimated Savings

**15 render-blocking resources** are loading synchronously in `<head>`, blocking first paint by up to 2,550 ms:

| Resource | Size | Delay |
|----------|------|-------|
| `stratusx/assets/css/app.css` | 47.9 KB | 1,227 ms |
| `ht-mega-for-elementor/htmega-global-style.min.css` | 52.2 KB | 1,527 ms |
| `font-awesome/css/fontawesome.css` (FA 5.15) | 13.3 KB | 627 ms |
| `jquery.min.js` (no async/defer) | 31.1 KB | 927 ms |
| `jquery-migrate.min.js` (no async/defer) | 5.1 KB | 327 ms |
| `font-awesome/js/v4-shims.min.js` (no async/defer) | 4.4 KB | 327 ms |
| `google-fonts/css/lato.css` | 0.8 KB | 177 ms |
| `google-fonts/css/varelaround.css` | 0.8 KB | 177 ms |
| `stratusx-child/style.css` | 0.4 KB | 177 ms |
| Plus 6 additional Font Awesome CSS files | — | 177 ms each |

This directly causes the 4.6 s FCP. Every millisecond here delays the user seeing anything at all.

**Fix:** Add `defer` to all non-critical scripts. Extract critical CSS (above-the-fold styles, ~5–10 KB) inline in `<head>` and load full stylesheets asynchronously with `<link rel="preload" as="style" onload="this.rel='stylesheet'">`. Use a plugin like WP Rocket or Perfmatters to automate this on WordPress.

---

#### 4. Main Thread Blocked for 8.4 s — Total Blocking Time 3,500 ms

Main-thread work breakdown:

| Category | Time |
|----------|------|
| Script Evaluation | 7,197 ms |
| Other | 611 ms |
| Style & Layout | 328 ms |
| Parse HTML & CSS | 108 ms |
| Garbage Collection | 70 ms |
| Rendering | 63 ms |
| Script Parsing & Compilation | 39 ms |

The dominant contributor is **Cloudflare Bot Management JS** (`cdn-cgi/challenge-platform/scripts/jsd/main.js`) which accounts for **6,840 ms of scripting time** on its own — more than 80% of all script evaluation. jQuery itself contributes 254 ms. This is the primary INP killer.

**Fix:** The Cloudflare bot challenge script cannot be removed if bot protection is required, but it must be investigated: is Bot Management (paid) or the free Bot Fight Mode enabled? Free Bot Fight Mode can be disabled if not needed. The script loading as a render-blocking redirect chain (302 → actual script) also adds latency. Consider whether the protection level is appropriate for the traffic profile.

---

#### 5. `noindex, nofollow` Meta Tag — Site Is De-indexed

```html
<meta name="robots" content="noindex, nofollow" />
```

The page is actively blocking all search engine crawlers. Google cannot index nesthub.ai. This is a SEO score of 0 for crawlability and is confirmed by Lighthouse audit `is-crawlable: FAIL`.

**Fix:** Remove or change to `<meta name="robots" content="index, follow" />`. This is almost certainly a staging/development setting left in production.

---

#### 6. `nesthub.ai` → `www.nesthub.ai` Redirect — 750 ms Lost Before Any Content Loads

Every visitor to `https://nesthub.ai` is hit with a 301 redirect to `https://www.nesthub.ai` before the page can begin loading. Lighthouse measures this as **+132 ms redirect latency** under lab conditions; on real mobile connections the round-trip cost is higher (~750 ms savings estimated).

**Fix:** Choose one canonical domain and enforce it at the Cloudflare level (Page Rule or Redirect Rule), not at the WordPress/WP Engine level. This eliminates the extra round-trip before the first byte.

---

### High

#### 7. 35 CSS Files Loading — 221.5 KB Total CSS, 134.7 KB (61%) Unused

The page loads **35 separate stylesheet requests** with a combined transfer size of 221.5 KB. Of the top 5 CSS files audited, **61% of bytes are unused CSS**:

| File | Wasted | Total | % Unused |
|------|--------|-------|----------|
| `htmega-global-style.min.css` | 51.9 KB | 51.9 KB | 100% |
| `stratusx/assets/css/app.css` | 45.2 KB | 47.6 KB | 95% |
| `font-awesome/css/fontawesome.css` (FA 5.15) | 12.7 KB | 12.7 KB | 99% |
| `font-awesome/css/all.min.css` (FA 4.0.8) | 12.6 KB | 12.7 KB | 99% |
| `font-awesome/css/fontawesome.min.css` (FA 5.15) | 12.3 KB | 12.4 KB | 99% |

Additionally, `stratusx/assets/css/app.css` is **unminified** (7.7 KB savings from minification).

**Fix:** Consolidate CSS into a single bundled file. Use PurgeCSS to remove unused rules. The HT Mega plugin global stylesheet is entirely unused and should be disabled or scoped. Target total CSS under 30 KB.

---

#### 8. Font Awesome Loaded 8 Times Across Multiple Versions

The technical audit context confirms 8 Font Awesome loads. The network request data shows at least 5 Font Awesome CSS files loading:

- `font-awesome/css/all.min.css` (FA 4.0.8 via Elementor)
- `font-awesome/css/fontawesome.css` (FA 5.15.3)
- `font-awesome/css/fontawesome.min.css` (FA 5.15.3)
- `font-awesome/css/solid.css` + `solid.min.css` (FA 5.15.3)
- `font-awesome/css/brands.css` (FA 5.15.3)
- `font-awesome/css/v4-shims.min.css` (compatibility shim)
- `th-widget-pack/assets/icons/icons.css` (custom icon font)

Plus the `fa-brands-400.woff2` (79.9 KB) and `fa-regular-400.woff2` (13.2 KB) font files lack `font-display: swap`, causing a **125 ms render block** on the brand icons.

**Fix:** Disable Font Awesome from all plugins that duplicate it. Use only the Elementor-managed FA instance. Disable `v4-shims` if no legacy FA4 classes are used. Add `font-display: swap` to all `@font-face` declarations.

---

#### 9. JavaScript Bundle: 165.8 KB Across 21 Files, 77% of Execution Time on One Script

Total JS transfer: **165.8 KB** across 21 separate requests. Key problems:

- `vendor_footer.js` (32.5 KB, 77% unused = 24.9 KB wasted) — theme bundle with dead code
- `jquery.min.js` loaded synchronously (31.1 KB, no `defer`)
- `htbbootstrap.js` (11.2 KB) — Bootstrap JS likely not needed for Elementor layouts
- `popper.min.js` (7.0 KB) — dependency of Bootstrap, equally unnecessary
- `wp-emoji-release.min.js` (5.4 KB) — WordPress emoji polyfill, nearly universally unneeded on SaaS product sites
- Cloudflare JSD script (10.4 KB + redirect overhead)

**Fix:** Add `defer` to jQuery, jQuery Migrate, and all plugin scripts. Dequeue `wp-emoji-release` via `functions.php`. Remove unused Bootstrap/Popper. Audit `vendor_footer.js` and remove dead modules.

---

#### 10. No Resource Hints — No `preconnect`, No `preload`, No `dns-prefetch`

The page has zero resource hints in `<head>`. There are no `<link rel="preconnect">`, `<link rel="preload">`, or `<link rel="dns-prefetch">` tags. This means:

- Font files (`lato.woff2`, `varela-round.woff2`) are discovered late, contributing to font FOUT
- The LCP image is not preloaded (discovered via CSS background, not HTML)
- No connection warming for any third-party origin

**Fix:**
```html
<link rel="preload" as="image" href="/wp-content/uploads/2025/06/1225.webp" fetchpriority="high">
<link rel="preload" as="font" href="/wp-content/fonts/lato/S6uyw4BMUTPHjx4wXg.woff2" crossorigin>
<link rel="preload" as="font" href="/wp-content/fonts/varela-round/w8gdH283Tvk__Lua32TysjIfp8uP.woff2" crossorigin>
```

---

### Medium

#### 11. `video.jpg` (126.9 KB) and `Frame-1321317316.png` (115.5 KB) Not in WebP

Two above-the-fold images are served as JPEG and PNG with no WebP/AVIF conversion:

- `video.jpg`: 126.9 KB (video poster image)
- `Frame-1321317316.png`: 115.5 KB, 78.6 KB wasted per Lighthouse image delivery audit

Total estimated savings from both: **~156 KB**.

**Fix:** Convert both to WebP. For the video poster, WebP typically achieves 40–60% size reduction over JPEG. For PNG with mixed content, AVIF often outperforms WebP.

---

#### 12. Logo Served at Wrong Resolution

`Logo-Design-for-Modern-Real-Estate-Software-1.png` is displayed at 227×84 CSS pixels but Lighthouse detects the actual rendered size as 151×56 — the image is oversized relative to its display context. Minor savings, but indicates no responsive image pipeline is in place.

**Fix:** Serve the logo at 2x (454×168) for retina, no larger, via `srcset`.

---

#### 13. Cache Policy: Only 600 Seconds (10 Minutes) on HTML

The `cache-control: max-age=600` header on `https://www.nesthub.ai/` is set to 10 minutes. Static assets such as CSS, JS, and images also show short or missing cache headers. The Cloudflare CF-Cache-Status returns `MISS` on www, meaning HTML is hitting the origin (WP Engine) on many requests.

**Fix:** Set long-lived cache headers (`max-age=31536000, immutable`) on versioned static assets (JS, CSS, fonts, images with cache-busting query strings or content hashes). For HTML, 600 s is reasonable if using Cloudflare caching, but ensure Cloudflare's Cache Everything page rule is enabled for HTML at the edge.

---

#### 14. Font Display Not Set — FOUT on Brand Icons

`fa-brands-400.woff2` (79.9 KB) and `fa-regular-400.woff2` (13.2 KB) do not have `font-display: swap` or `font-display: optional` set in their `@font-face` rules. This causes the browser to block rendering of icon glyphs for up to 125 ms while fonts download.

**Fix:** Add `font-display: swap` to all `@font-face` declarations in the Font Awesome CSS, or use `font-display: optional` if the icon set is not critical to layout.

---

#### 15. Cloudflare Bot Management Script: Deprecated APIs

The Cloudflare bot management script (`cdn-cgi/challenge-platform/scripts/jsd/main.js`) triggers 3 browser deprecation warnings:

1. **Shared Storage API deprecated** — will be removed in a future Chrome release
2. **StorageType.persistent deprecated** — should use `navigator.storage`
3. **Protected Audience API deprecated** — will be removed in a future Chrome release

These are in Cloudflare's code, not nesthub.ai's, but they indicate the Bot Management product version is outdated.

**Fix:** Ensure Cloudflare Bot Management is on the latest version. These warnings can be suppressed or resolved by updating the Cloudflare configuration via the dashboard.

---

#### 16. `video.jpg` as Video Poster is 126.9 KB JPEG

The page embeds a video player with a JPEG poster image that is 126.9 KB. The poster image is above-the-fold for some viewport sizes.

**Fix:** Compress the poster to under 20 KB at WebP. Video posters do not need high resolution — a blurred/low-quality placeholder is sufficient since the video controls overlay it immediately.

---

### Low

#### 17. No Meta Description

`<meta name="description">` is missing entirely (Lighthouse `meta-description: FAIL`). While this is primarily an SEO issue, it also affects click-through rate in any search results where nesthub.ai might appear.

**Fix:** Add a compelling 140–160 character meta description to the homepage.

---

#### 18. Heading Order Skips Levels

The first heading in the DOM is an `<h4>` ("NestHub tracks homes, comparables...") with no preceding `<h1>`, `<h2>`, or `<h3>`. Elementor's default heading widget does not enforce semantic heading hierarchy.

**Fix:** Ensure the hero section uses `<h1>` for the primary headline. Use H2 for section titles. Audit all Elementor heading widgets and set correct heading tags, not just font sizes.

---

#### 19. `app.css` Is Unminified — 7.7 KB Savings

`stratusx/assets/css/app.css` is served without minification, wasting 7.7 KB. Combined with the 95% unused CSS in this file, the priority is to PurgeCSS it rather than just minify it — but minification is a trivially cheap win in the meantime.

**Fix:** Enable CSS minification in WP Rocket / Autoptimize, or minify the theme stylesheet at build time.

---

#### 20. Unminified JavaScript — 5 KB Savings

`vendor_footer.js` contains 5 KB of unminified code. Minor gain after the more impactful dead-code removal.

**Fix:** Enable JS minification in the optimization plugin or at build time.

---

## Page Weight Breakdown

**Total transfer size: 2,198 KB (2.15 MB)**

| Resource Type | Files | Size |
|---------------|-------|------|
| Images | 11 | 1,554.9 KB (71%) |
| Stylesheets | 35 | 221.5 KB (10%) |
| Scripts | 21 | 165.8 KB (8%) |
| Fonts | 9 | 192.3 KB (9%) |
| Media (video) | 3 | 43.4 KB (2%) |
| Other | — | ~20 KB (1%) |

The hero image alone (`1225.jpg` at 1,300.9 KB) is **59% of total page weight**. Fixing that single image to WebP at quality 80 would bring total page weight to approximately 1,000 KB — a 54% reduction in a single change.

---

## Redirect Chain

```
https://nesthub.ai  →301→  https://www.nesthub.ai  →200→  page loads
```

- Redirect type: 301 Permanent (WordPress-generated, served by WP Engine)
- Additional latency: ~130 ms under Lighthouse simulation, up to 750 ms on real mobile
- The `nesthub.ai` redirect includes a Cloudflare `__cf_bm` cookie set (security) before the 301, adding one extra round-trip

---

## Infrastructure Notes

- **CDN:** Cloudflare (confirmed via `server: cloudflare`, `cf-ray` headers, HTTP/3 `h3` protocol)
- **Hosting:** WP Engine (confirmed via `x-powered-by: WP Engine`)
- **CMS:** WordPress with Elementor page builder (4.0.8), HT Mega plugin, StratusX theme
- **TTFB:** 20 ms (excellent — Cloudflare edge caching is working for HTML)
- **HTTP/3:** Enabled (`alt-svc: h3=":443"`) — modern transport in use
- **HTML compression:** Enabled (confirmed by `usesCompression: true` in Lighthouse)
- **Cache-Control on HTML:** `max-age=600, must-revalidate` (10 minutes, adequate)
- **CF-Cache-Status:** MISS on www at time of test — HTML not being served from Cloudflare edge cache, hitting WP Engine origin

---

## Prioritized Recommendations

Listed in order of expected LCP / performance impact:

1. **[Critical] Convert hero image to WebP/AVIF + compress to <100 KB** — eliminates 887 KB, directly cuts LCP by ~8–10 s
2. **[Critical] Change LCP element from CSS background to `<img fetchpriority="high">`** + add `<link rel="preload">` — makes LCP image browser-discoverable
3. **[Critical] Remove `noindex, nofollow` meta robots tag** — site is invisible to search engines
4. **[Critical] Defer/async all render-blocking scripts (jQuery, jQuery Migrate, FA shims)** — saves 2,550 ms of FCP delay
5. **[Critical] Inline critical CSS, load full stylesheets async** — eliminates remaining render-blocking CSS
6. **[Critical] Investigate Cloudflare Bot Management script** — 6,840 ms scripting time, main cause of high TBT/INP
7. **[High] Consolidate 35 CSS files into 1 bundle, run PurgeCSS** — removes 134 KB of unused CSS
8. **[High] Deduplicate Font Awesome to single instance** — removes ~60–80 KB of duplicate CSS + multiple wasted requests
9. **[High] Add `font-display: swap` to all `@font-face` rules** — prevents font render block
10. **[High] Add resource hints: `preload` for LCP image and body fonts** — reduces LCP subpart delays
11. **[Medium] Fix www redirect at Cloudflare edge** — saves ~130–750 ms before any content loads
12. **[Medium] Convert `video.jpg` and `Frame-1321317316.png` to WebP** — saves ~156 KB
13. **[Medium] Dequeue `wp-emoji-release.min.js`** — removes unnecessary 5.4 KB script
14. **[Medium] Remove Bootstrap + Popper JS if not used** — removes ~18 KB dead JS
15. **[Low] Add meta description** — required for SEO
16. **[Low] Fix heading order** — accessibility and SEO structural issue
17. **[Low] Minify `app.css`** — saves 7.7 KB

---

## Estimated Impact After Top 3 Fixes

| Fix | Expected LCP Improvement |
|-----|--------------------------|
| Hero image WebP + <100 KB | -6 to -8 s LCP |
| `<img fetchpriority="high">` + `<link rel="preload">` | -2 to -3 s LCP |
| Defer render-blocking scripts + inline critical CSS | -1 to -2 s FCP/LCP |

Combined, these three changes alone could bring LCP from 14.4 s to approximately 3–5 s on mobile. Fixing the Cloudflare script issue or its impact on TBT is the key lever for INP.

---

*Audit conducted with Lighthouse CLI 13.3, mobile simulation (4G throttle, 4x CPU), 2026-05-14. No CrUX field data available (PSI API quota exhausted). Validate against 28-day CrUX data at [CrUX Vis](https://cruxvis.withgoogle.com) for real-world percentile assessment.*
