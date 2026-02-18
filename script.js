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
