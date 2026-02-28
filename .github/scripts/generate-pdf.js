const puppeteer = require('puppeteer');

(async () => {
  // --no-sandbox is required in CI environments (GitHub Actions runs as root,
  // which Chrome's sandbox does not support)
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // networkidle0 waits until there are no in-flight network requests for 500ms,
  // ensuring Google Fonts have fully loaded before the PDF is captured
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  // Path is relative to the working directory (repo root), so resume.pdf lands
  // there and can be committed by the workflow. Margins are zeroed so CSS
  // controls all spacing — avoids browser-added whitespace around the page.
  // printBackground: false omits background colours, keeping the PDF clean for
  // printing (dark mode backgrounds are excluded).
  await page.pdf({
    path: 'resume.pdf',
    format: 'A4',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: false
  });

  await browser.close();
  console.log('resume.pdf generated');
})();
