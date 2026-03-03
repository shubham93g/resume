# Resume

[![CI](https://github.com/shubham93g/resume/actions/workflows/ci.yml/badge.svg)](https://github.com/shubham93g/resume/actions/workflows/ci.yml)

Live at: https://shubham93g.github.io/resume/

An HTML resume designed to work well in three contexts: browser (desktop + mobile), print (A4), and PDF download. Each imposes different constraints, and a few of the decisions made to balance them are worth documenting.

## Technical notes

### CI/CD

A single workflow (`ci.yml`) runs three jobs sequentially: `validate` checks correctness before anything ships; `generate-pdf` renders the PDF via Puppeteer; `deploy` pushes the site and PDF to GitHub Pages. The last two are skipped on PRs — only `validate` runs and it's the required branch protection check. Shared Puppeteer setup (Node, Puppeteer install, local HTTP server) lives in a composite action reused by both `validate` and `generate-pdf`, and Puppeteer launch and PDF options are centralised in a single config file.

### Validation

Before the PDF is generated or the site is deployed, the `validate` job runs a Puppeteer-based test suite against a local server. It checks two things:

**URL params** — the page has a theme toggle (dark/light) and font-size adjustment controls. Both are reachable via URL params (`?theme=dark|light`, `?font=N` where N is an integer from `-2` to `+4`), which is how Puppeteer drives them in CI for a reproducible render. The initialisation order is: URL param → `localStorage` → `prefers-color-scheme` — so a URL param wins, a returning user gets their saved preference, and a first-time visitor gets the OS default. The test suite checks that `?theme=dark` and `?theme=light` apply correctly, that invalid values (`?theme=invalid`, `?font=abc`, out-of-range integers) don't crash and resolve within valid bounds.

**Page count** — the PDF must be exactly 2 A4 pages. This is a hard constraint, not a guideline: the layout is sized to fit and has no slack, so any change that adds vertical space (padding, margins, new content) needs to reclaim it elsewhere. The test generates the PDF and counts `/Type /Page` objects in the raw bytes, which catches regressions before they reach the deploy job.

Results are written to the GitHub Actions step summary as a table, so failures are visible without digging through logs.

### PDF generation

The `generate-pdf` job renders the page using `?theme=dark&font=1` for a consistent output regardless of the CI environment's system theme. Two Puppeteer settings matter for producing a usable PDF:

- `waitUntil: 'networkidle0'` ensures the self-hosted fonts have fully loaded before the page is captured.
- `tagged: true` tells Chromium's PDF engine to emit a tagged PDF with a proper text layer — this is what preserves the ToUnicode CMap tables that make text in the PDF selectable and copyable.

The PDF is not committed to the repository; it's generated fresh on every push to main and served via GitHub Pages.

### Font embedding

IBM Plex Sans is self-hosted as TTF files (`fonts/`) rather than loaded from Google Fonts. Without `tagged: true` this wouldn't matter much, but with it the font format does: Chrome's PDF engine embeds WOFF2 with incomplete ToUnicode CMap tables, which breaks text selection in some viewers — macOS Preview being the most common case. TTF preserves the full character mapping. Self-hosting also means the font is never converted to WOFF2 on the way to the PDF engine.
