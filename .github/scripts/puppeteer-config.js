const BASE_URL = 'http://localhost:8080';

// --no-sandbox is required in CI environments (GitHub Actions runs as root,
// which Chrome's sandbox does not support)
const LAUNCH_OPTIONS = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

// Margins are zeroed so CSS controls all spacing.
// printBackground: false omits background colours, keeping the PDF clean for
// printing (dark mode backgrounds are excluded).
// tagged generates a PDF with a proper text layer, enabling text selection
// and copy-paste in PDF viewers. Also preserves ToUnicode CMap tables when
// using self-hosted TTF fonts (vs WOFF2 via Google Fonts).
const PDF_OPTIONS = {
  format: 'A4',
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  printBackground: false,
  tagged: true,
};

module.exports = { BASE_URL, LAUNCH_OPTIONS, PDF_OPTIONS };
