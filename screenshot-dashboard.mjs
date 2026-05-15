import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1400, height: 900 },
});

const page = await browser.newPage();

// Inject a mock auth state by intercepting Firebase and
// rendering the dashboard with fake session data in localStorage
await page.goto('http://localhost:5176/preview-dashboard', { waitUntil: 'networkidle2', timeout: 15000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: './docs/img/dashboard-new.png', fullPage: false });
console.log('✓ dashboard-new.png');

await browser.close();
