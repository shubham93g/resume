// --- Theme ---

const THEME_STORAGE_KEY = 'theme';
const THEME_ATTR = 'data-theme';
const DARK = 'dark';
const LIGHT = 'light';

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Apply saved or system theme immediately to avoid flash
(function () {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || (systemThemeQuery.matches ? DARK : LIGHT);
  document.documentElement.setAttribute(THEME_ATTR, saved);
})();

// Respond to OS-level preference changes when no manual preference is saved
systemThemeQuery.addEventListener('change', function (e) {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    document.documentElement.setAttribute(THEME_ATTR, e.matches ? DARK : LIGHT);
  }
});

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute(THEME_ATTR) === DARK ? LIGHT : DARK;
  html.setAttribute(THEME_ATTR, next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', toggleTheme);
toggle.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
});

// --- Font size ---

const FONT_OFFSET_KEY = 'fontOffset';
const FONT_OFFSET_MIN = -2;
const FONT_OFFSET_MAX = 4;
const FONT_BASE_PT = 10;    // matches html { font-size: 10pt } in style.css
const PAGE_WIDTH_MM = 210;  // matches A4 width; drives desktop page scaling

const decreaseBtn = document.getElementById('font-decrease');
const increaseBtn = document.getElementById('font-increase');

function getFontOffset() {
  return parseInt(localStorage.getItem(FONT_OFFSET_KEY) || '0', 10);
}

// Apply persisted font offset on load
(function () {
  const offset = getFontOffset();
  applyFontSettings(offset);
  updateFontOffsetButtons(offset);
})();

function applyFontSettings(offset) {
  document.documentElement.style.setProperty('--font-offset', offset + 'pt');
  const pageWidth = PAGE_WIDTH_MM + Math.max(0, offset) * (PAGE_WIDTH_MM / FONT_BASE_PT);
  document.documentElement.style.setProperty('--page-width', pageWidth + 'mm');
}

function changeFontOffset(delta) {
  const next = Math.min(FONT_OFFSET_MAX, Math.max(FONT_OFFSET_MIN, getFontOffset() + delta));
  applyFontSettings(next);
  localStorage.setItem(FONT_OFFSET_KEY, String(next));
  updateFontOffsetButtons(next);
}

function updateFontOffsetButtons(offset) {
  decreaseBtn.disabled = offset <= FONT_OFFSET_MIN;
  increaseBtn.disabled = offset >= FONT_OFFSET_MAX;
  document.getElementById('font-size-value').textContent = offset > 0 ? '+' + offset : String(offset);
}

decreaseBtn.addEventListener('click', function () { changeFontOffset(-1); });
increaseBtn.addEventListener('click', function () { changeFontOffset(+1); });

// --- PDF Share ---

const shareBtn = document.getElementById('share-btn');
const PDF_URL = document.getElementById('download-btn').getAttribute('href');

shareBtn.addEventListener('click', async function () {
  const url = new URL(PDF_URL, location.href).href;
  if (navigator.share) {
    try {
      await navigator.share({ url: url });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // user dismissed share sheet
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
});
