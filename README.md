# Resume

[![CI](https://github.com/shubham93g/resume/actions/workflows/ci.yml/badge.svg)](https://github.com/shubham93g/resume/actions/workflows/ci.yml)

Live at: https://shubham93g.github.io/resume/

An HTML resume built to work across browser, phone, print, and PDF.

## Features

- **PDF download** — one-click save button in the page, consistent across devices and independent of the browser print flow
- **Dark mode** — theme toggle in the page; follows system preference by default, remembered across visits
- **Font size** — adjustment controls in the page; preference remembered across visits
- **URL params** — `?theme=` and `?font=` let you override the initial state for a visit without affecting the saved preference
- **Mobile** — layout adapts for portrait phone screens
- **Print** — targets exactly 2 A4 pages; dark mode is suppressed at print time

## Technical notes

### CI/CD

A single workflow (`ci.yml`) runs three jobs sequentially: `validate` checks correctness before anything ships; `generate-pdf` renders the PDF via Puppeteer; `deploy` pushes the site and PDF to GitHub Pages. The last two are skipped on PRs — only `validate` runs and it's the required branch protection check. Shared Puppeteer setup (Node, Puppeteer install, local HTTP server) lives in a composite action reused by both `validate` and `generate-pdf`, and Puppeteer launch and PDF options are centralised in a single config file.

### Validation

Before the PDF is generated or the site is deployed, the `validate` job runs a Puppeteer-based test suite against a local server. It checks that URL params apply correctly and that invalid values don't crash and resolve within valid bounds. It also generates the PDF and counts `/Type /Page` objects in the raw bytes to assert the page count is exactly 2 — catching layout regressions before they reach the deploy job. Results are written to the GitHub Actions step summary as a table, so failures are visible without digging through logs.

### PDF generation

Puppeteer navigates to the page and captures it with two settings that matter for a usable output: `waitUntil: 'networkidle0'` ensures the self-hosted fonts have fully loaded before capture; `tagged: true` tells Chromium's PDF engine to emit a tagged PDF with a proper text layer, which is what keeps text selectable and copyable in PDF viewers. The PDF is not committed to the repository — it's generated fresh on every push to main and served via GitHub Pages.

### Font embedding

IBM Plex Sans is self-hosted as TTF files (`fonts/`) rather than loaded from Google Fonts. The reason is specific to `tagged: true`: Chrome's PDF engine embeds WOFF2 with incomplete ToUnicode CMap tables, which breaks text selection in some viewers — macOS Preview being the most common case. TTF preserves the full character mapping. Self-hosting also means the font is never converted to WOFF2 on the way to the PDF engine.
