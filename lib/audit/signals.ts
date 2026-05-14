/**
 * Public-signal collector for inspection-mode ads audits.
 * Detects tracking pixels, ad tags, and ad library presence without account access.
 */
import { chromium } from 'playwright';

export interface AdSignals {
  domain: string;
  url: string;
  pageTitle: string;
  pixelsDetected: string[];
  scriptsFound: string[];
  metaAdsLibraryHint: string;
  businessType: string;
  industry: string;
  hasEcommerce: boolean;
  hasLeadForm: boolean;
  pageDescription: string;
}

const PIXEL_PATTERNS: Record<string, RegExp[]> = {
  'Google Ads (gtag)': [/googletagmanager\.com\/gtag\/js/, /gtag\(['"]config['"],\s*['"]AW-/],
  'Google Ads (UA)': [/google-analytics\.com\/analytics\.js/],
  'Google Tag Manager': [/googletagmanager\.com\/gtm\.js/],
  'Meta Pixel': [/connect\.facebook\.net\/.*\/fbevents\.js/, /fbq\(['"]init['"]/],
  'Meta CAPI hint': [/graph\.facebook\.com\/.*\/events/],
  'LinkedIn Insight Tag': [/snap\.licdn\.com\/li\.lms-analytics/, /platform\.linkedin\.com\/badges/],
  'TikTok Pixel': [/analytics\.tiktok\.com/, /ttq\.load\(/],
  'Microsoft UET': [/bat\.bing\.com\/bat\.js/, /uetq\s*=/],
  'Hotjar': [/static\.hotjar\.com/],
  'Clarity': [/clarity\.ms\/tag/],
  'HubSpot': [/js\.hsforms\.net/, /js\.hs-scripts\.com/],
  'Intercom': [/widget\.intercom\.io/],
};

export async function collectPublicSignals(domain: string): Promise<AdSignals> {
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const browser = await chromium.launch({ headless: true });
  const pixelsDetected: string[] = [];
  const scriptsFound: string[] = [];

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Capture all script/network requests for pixel detection
    const capturedUrls: string[] = [];
    page.on('request', (req) => {
      if (['script', 'fetch', 'xhr', 'image'].includes(req.resourceType())) {
        capturedUrls.push(req.url());
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(2500);

    const pageContent = await page.content().catch(() => '');
    const pageTitle = await page.title().catch(() => '');
    const pageDescription = await page
      .$eval('meta[name="description"]', (el) => (el as HTMLMetaElement).content)
      .catch(() => '');

    // Combine inline source + network requests for pixel detection
    const allSources = [pageContent, ...capturedUrls].join('\n');

    for (const [name, patterns] of Object.entries(PIXEL_PATTERNS)) {
      if (patterns.some((re) => re.test(allSources))) {
        pixelsDetected.push(name);
      }
    }

    // Collect unique third-party script domains
    const thirdPartyDomains = new Set<string>();
    for (const u of capturedUrls) {
      try {
        const h = new URL(u).hostname;
        if (!h.includes(domain.replace(/^https?:\/\//, '').split('/')[0])) {
          thirdPartyDomains.add(h);
        }
      } catch {
        // ignore
      }
    }
    scriptsFound.push(...[...thirdPartyDomains].slice(0, 30));

    // Heuristics for business type
    const lowerContent = pageContent.toLowerCase();
    const hasEcommerce =
      /add.to.cart|buy.now|checkout|shopify|woocommerce|stripe|payment/i.test(lowerContent);
    const hasLeadForm =
      /contact.us|get.a.quote|book.a.demo|request.a.demo|schedule.a.call|free.trial/i.test(
        lowerContent,
      );

    let businessType = 'B2B SaaS';
    if (hasEcommerce) businessType = 'E-commerce';
    else if (/agency|marketing|design|development|consulting/i.test(lowerContent))
      businessType = 'Agency/Services';
    else if (/restaurant|hotel|local|near.me/i.test(lowerContent)) businessType = 'Local Business';
    else if (hasLeadForm) businessType = 'Lead Gen / B2B';

    const industryKeywords: Record<string, RegExp> = {
      'Technology / SaaS': /saas|software|platform|api|developer|cloud|automation/i,
      'E-commerce / Retail': /shop|store|fashion|apparel|electronics|product/i,
      'Finance / Fintech': /finance|fintech|invest|banking|crypto|payments/i,
      'Healthcare': /health|medical|clinic|wellness|therapy|doctor/i,
      'Education': /learn|course|education|training|university|school/i,
      'Real Estate': /real estate|property|homes|apartment|rent|mortgage/i,
      'Marketing / Agency': /agency|marketing|seo|ads|digital|creative/i,
    };
    let industry = 'General';
    for (const [ind, re] of Object.entries(industryKeywords)) {
      if (re.test(lowerContent)) { industry = ind; break; }
    }

    // Meta Ad Library hint (just check if domain appears in library searches)
    const metaAdsLibraryHint = pixelsDetected.includes('Meta Pixel')
      ? `Meta Pixel detected — search Meta Ad Library at https://www.facebook.com/ads/library/?q=${encodeURIComponent(domain)} to see active ads`
      : 'No Meta Pixel detected — unlikely to have active Meta campaigns';

    return {
      domain,
      url,
      pageTitle,
      pixelsDetected,
      scriptsFound,
      metaAdsLibraryHint,
      businessType,
      industry,
      hasEcommerce,
      hasLeadForm,
      pageDescription,
    };
  } finally {
    await browser.close();
  }
}
