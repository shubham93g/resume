const puppeteer = require('puppeteer');
const fs = require('fs');
const { BASE_URL, LAUNCH_OPTIONS, GOTO_OPTIONS, PDF_OPTIONS } = require('./puppeteer-config');
const FONT_OFFSET_MIN = -2;
const FONT_OFFSET_MAX = 4;

const results = [];

async function validate(description, fn) {
  try {
    await fn();
    results.push({ description, passed: true });
    console.log(`  ✓ ${description}`);
  } catch (e) {
    results.push({ description, passed: false, error: e.message });
    console.log(`  ✗ ${description}: ${e.message}`);
  }
}

async function getTheme(page, params) {
  await page.goto(`${BASE_URL}/${params ? '?' + params : ''}`, GOTO_OPTIONS);
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

async function getFontOffset(page, params) {
  await page.goto(`${BASE_URL}/?${params}`, GOTO_OPTIONS);
  const raw = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--font-offset').trim()
  );
  return parseFloat(raw); // e.g. "1pt" → 1
}

(async () => {
  const browser = await puppeteer.launch(LAUNCH_OPTIONS);

  console.log('\nTheme params');
  {
    const page = await browser.newPage();
    await validate('?theme=dark applies dark theme', async () => {
      const theme = await getTheme(page, 'theme=dark');
      if (theme !== 'dark') {
        throw new Error(`Expected dark, got ${theme}`);
      }
    });
    await validate('?theme=light applies light theme', async () => {
      const theme = await getTheme(page, 'theme=light');
      if (theme !== 'light') {
        throw new Error(`Expected light, got ${theme}`);
      }
    });
    await validate('?theme=invalid does not crash', async () => {
      const theme = await getTheme(page, 'theme=invalid');
      if (theme !== 'dark' && theme !== 'light') {
        throw new Error(`Expected dark or light, got ${theme}`);
      }
    });
    await page.close();
  }

  console.log('\nFont params');
  {
    const page = await browser.newPage();
    await validate('?font=1 applies +1 offset', async () => {
      const offset = await getFontOffset(page, 'font=1');
      if (offset !== 1) {
        throw new Error(`Expected 1, got ${offset}`);
      }
    });
    await validate('?font=-2 applies min boundary', async () => {
      const offset = await getFontOffset(page, 'font=-2');
      if (offset !== FONT_OFFSET_MIN) {
        throw new Error(`Expected ${FONT_OFFSET_MIN}, got ${offset}`);
      }
    });
    await validate('?font=4 applies max boundary', async () => {
      const offset = await getFontOffset(page, 'font=4');
      if (offset !== FONT_OFFSET_MAX) {
        throw new Error(`Expected ${FONT_OFFSET_MAX}, got ${offset}`);
      }
    });
    await validate('?font=-3 (below min) falls back gracefully', async () => {
      const offset = await getFontOffset(page, 'font=-3');
      if (isNaN(offset) || offset < FONT_OFFSET_MIN || offset > FONT_OFFSET_MAX) {
        throw new Error(`Out of range: ${offset}`);
      }
    });
    await validate('?font=5 (above max) falls back gracefully', async () => {
      const offset = await getFontOffset(page, 'font=5');
      if (isNaN(offset) || offset < FONT_OFFSET_MIN || offset > FONT_OFFSET_MAX) {
        throw new Error(`Out of range: ${offset}`);
      }
    });
    await validate('?font=abc falls back gracefully', async () => {
      const offset = await getFontOffset(page, 'font=abc');
      if (isNaN(offset) || offset < FONT_OFFSET_MIN || offset > FONT_OFFSET_MAX) {
        throw new Error(`Out of range: ${offset}`);
      }
    });
    await page.close();
  }

  console.log('\nPDF');
  {
    const page = await browser.newPage();
    await validate('PDF is exactly 2 pages', async () => {
      await page.goto(BASE_URL, GOTO_OPTIONS);
      const pdf = await page.pdf(PDF_OPTIONS);
      // /Type /Page (word boundary) matches page objects, not the /Type /Pages tree root
      const pageCount = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
      if (pageCount !== 2) {
        throw new Error(`Expected 2 pages, got ${pageCount}`);
      }
    });
    await page.close();
  }

  await browser.close();

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n${passed} passed, ${failed} failed\n`);

  // Write markdown summary for GitHub Actions step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    let md = '## Validation Results\n\n| Status | Case |\n|--------|------|\n';
    for (const r of results) {
      const status = r.passed ? '✅' : '❌';
      const detail = r.error ? ` — \`${r.error}\`` : '';
      md += `| ${status} | ${r.description}${detail} |\n`;
    }
    md += `\n**${passed} passed, ${failed} failed**\n`;
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  }

  if (failed > 0) {
    process.exit(1);
  }
})();
