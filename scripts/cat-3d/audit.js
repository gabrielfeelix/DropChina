const { chromium } = require('playwright');
const lighthouse = require('lighthouse').default;
const fs = require('fs');

const URL = process.argv[2] || 'https://dropchinaoficial.com.br/';
const FORM = process.argv[3] || 'mobile';

(async () => {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9223', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const res = await lighthouse(URL, {
    port: 9223,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: FORM,
    screenEmulation: FORM === 'mobile'
      ? { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }
      : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling: FORM === 'mobile'
      ? undefined
      : { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
  });
  const lhr = res.lhr;
  fs.writeFileSync(`lhr-${FORM}.json`, JSON.stringify(lhr));
  const a = lhr.audits;
  const out = {};
  out.scores = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  out.metrics = {
    FCP: a['first-contentful-paint'].numericValue,
    LCP: a['largest-contentful-paint'].numericValue,
    TBT: a['total-blocking-time'].numericValue,
    CLS: a['cumulative-layout-shift'].numericValue,
    SI: a['speed-index'].numericValue,
    TTFB: a['server-response-time'] && a['server-response-time'].numericValue,
  };
  const items = (k) => (a[k] && a[k].details && a[k].details.items) || [];
  out.lcpElement = items('largest-contentful-paint-element').map((i) => JSON.stringify(i).slice(0, 300));
  out.lcpPhases = items('lcp-lazy-loaded').length;
  out.renderBlocking = items('render-blocking-resources').map((i) => ({ u: i.url.slice(-70), ms: Math.round(i.wastedMs), kb: Math.round((i.totalBytes || 0) / 1024) }));
  out.unusedJs = items('unused-javascript').map((i) => ({ u: i.url.slice(-70), kb: Math.round(i.wastedBytes / 1024), pct: Math.round(i.wastedPercent) })).slice(0, 12);
  out.unusedCss = items('unused-css-rules').map((i) => ({ u: i.url.slice(-70), kb: Math.round(i.wastedBytes / 1024) })).slice(0, 8);
  out.images = items('uses-optimized-images').concat(items('modern-image-formats'), items('uses-responsive-images'))
    .map((i) => ({ u: (i.url || '').slice(-75), kb: Math.round((i.wastedBytes || 0) / 1024) }))
    .filter((i) => i.kb > 5).slice(0, 20);
  out.thirdParty = items('third-party-summary').map((i) => ({ e: i.entity, block: Math.round(i.blockingTime), kb: Math.round(i.transferSize / 1024) })).slice(0, 15);
  out.cache = items('uses-long-cache-ttl').map((i) => ({ u: i.url.slice(-60), kb: Math.round(i.totalBytes / 1024), ttl: i.cacheLifetimeMs })).slice(0, 12);
  out.payload = { total: Math.round((a['total-byte-weight'].numericValue || 0) / 1024), items: items('total-byte-weight').map((i) => ({ u: i.url.slice(-70), kb: Math.round(i.totalBytes / 1024) })).slice(0, 15) };
  out.dom = a['dom-size'] && a['dom-size'].numericValue;
  out.longTasks = items('long-tasks').map((i) => ({ u: i.url.slice(-60), ms: Math.round(i.duration) })).slice(0, 10);
  out.mainthread = items('mainthread-work-breakdown').map((i) => ({ g: i.groupLabel, ms: Math.round(i.duration) }));
  out.failedA11y = Object.values(a).filter((x) => x.score !== null && x.score < 1 && lhr.categories.accessibility.auditRefs.some((r) => r.id === x.id)).map((x) => x.id);
  out.failedBP = Object.values(a).filter((x) => x.score !== null && x.score < 1 && lhr.categories['best-practices'].auditRefs.some((r) => r.id === x.id)).map((x) => x.id);
  out.failedSeo = Object.values(a).filter((x) => x.score !== null && x.score < 1 && lhr.categories.seo.auditRefs.some((r) => r.id === x.id)).map((x) => x.id);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
