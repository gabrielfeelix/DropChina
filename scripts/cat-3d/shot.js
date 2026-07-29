const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  await page.goto('file://' + path.resolve(__dirname, 'test.html'));
  await page.waitForTimeout(600);
  await page.evaluate(() => document.getElementById('g').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(9000);

  const grid = page.locator('#g');
  await grid.screenshot({ path: 'out-rest.png' });

  // hover no 5º card (Placas de Vídeo)
  await page.locator('.dc-cat').nth(4).hover();
  await page.waitForTimeout(700);
  await grid.screenshot({ path: 'out-hover.png' });

  // mobile: 3 colunas, caixas de arte encostadas
  await page.setViewportSize({ width: 390, height: 780 });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById('g').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(1200);
  await page.locator('.dc-cat').nth(1).hover();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'out-mobile.png' });

  const diag = await page.evaluate(() => {
    const c = document.querySelector('.dc-cat3d__canvas');
    return { hasCanvas: !!c, on: document.getElementById('g').classList.contains('dc-cat3d-on'), w: c && c.width, h: c && c.height };
  });
  console.log(JSON.stringify(diag), 'errors:', errs.slice(0, 5));
  await browser.close();
})();
