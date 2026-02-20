const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // waitUntil: networkidle0 ensures Google Fonts fully load before capture
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
  await page.pdf({
    path: 'resume.pdf',
    format: 'A4',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: false
  });
  await browser.close();
  console.log('resume.pdf generated');
})();
