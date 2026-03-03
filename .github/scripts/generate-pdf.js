const puppeteer = require('puppeteer');
const { BASE_URL, LAUNCH_OPTIONS, PDF_OPTIONS } = require('./puppeteer-config');

(async () => {
  const browser = await puppeteer.launch(LAUNCH_OPTIONS);
  const page = await browser.newPage();

  // networkidle0 waits until there are no in-flight network requests for 500ms,
  // ensuring fonts have fully loaded before the PDF is captured
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // path is relative to the working directory (repo root)
  await page.pdf({ path: 'resume.pdf', ...PDF_OPTIONS });

  await browser.close();
  console.log('resume.pdf generated');
})();
