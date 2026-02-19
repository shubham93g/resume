var THEME_STORAGE_KEY = 'theme';
var THEME_ATTR = 'data-theme';
var DARK = 'dark';
var LIGHT = 'light';

var systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

(function () {
  var saved = localStorage.getItem(THEME_STORAGE_KEY) || (systemThemeQuery.matches ? DARK : LIGHT);
  document.documentElement.setAttribute(THEME_ATTR, saved);
})();

// Respond to OS-level preference changes when no manual preference is saved
systemThemeQuery.addEventListener('change', function (e) {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    document.documentElement.setAttribute(THEME_ATTR, e.matches ? DARK : LIGHT);
  }
});

function toggleTheme() {
  var html = document.documentElement;
  var next = html.getAttribute(THEME_ATTR) === DARK ? LIGHT : DARK;
  html.setAttribute(THEME_ATTR, next);
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

var toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', toggleTheme);
toggle.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
});

var FONT_OFFSET_KEY = 'fontOffset';
var FONT_OFFSET_MIN = -2;
var FONT_OFFSET_MAX = 4;

var decreaseBtn = document.getElementById('font-decrease');
var increaseBtn = document.getElementById('font-increase');

(function () {
  var offset = parseInt(localStorage.getItem(FONT_OFFSET_KEY) || '0', 10);
  applyFontOffset(offset);
  updateFontOffsetButtons(offset);
})();

function applyFontOffset(offset) {
  document.documentElement.style.setProperty('--font-offset', offset + 'pt');
}

function changeFontOffset(delta) {
  var current = parseInt(localStorage.getItem(FONT_OFFSET_KEY) || '0', 10);
  var next = Math.min(FONT_OFFSET_MAX, Math.max(FONT_OFFSET_MIN, current + delta));
  applyFontOffset(next);
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
