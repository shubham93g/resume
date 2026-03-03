# Resume

## Overview
- This is a resume that is expected to work on desktop, portrait mobile and printable on 2 A4 pages. 
- A4 print is strictly 2 pages — no exceptions. Before applying any change that adds vertical space (new lines, margins, padding), explicitly consider the print impact and whether space needs to be reclaimed elsewhere.
- HTML, javascript and stylesheet should be cleanly separated.
- Dark more is supported on desktop and mobile but not when printing.
- Prioritise simplicity and consistency when setting up formatting rules.
- Avoid overrides unless necessary — prefer updating the base rule
- Keep ATS compatibility in mind — use standard section headings, avoid tables for key content, ensure technologies and keywords are explicitly listed

## Fonts
- IBM Plex Sans is self-hosted as TTF files in `fonts/` (Regular, SemiBold, Bold) — do NOT switch back to Google Fonts
- Google Fonts serves WOFF2, which when embedded by Chrome's PDF engine produces incomplete ToUnicode CMap tables, breaking text selection in PDF viewers (notably macOS Preview)
- TTF embedding preserves the full character mapping, making text in the generated PDF selectable and copyable

## URL Parameters
- `?theme=dark` and `?theme=light` override the initial theme for that visit (without persisting to localStorage)
- `?font=N` overrides the initial font size offset for that visit (without persisting); N must be an integer within `[-2, 4]`
- These params must remain **backward compatible** — never remove or rename them, never change their semantics
- Invalid/unknown param values must silently fall back to localStorage → system preference, never throw or break the page
- The print-only link in `.header-contact` depends on `?theme=dark&font=1` — keep that URL valid

## CI/CD
- A single `ci.yml` workflow runs on every push to main and every PR
- Jobs run sequentially: `validate` → `generate-pdf` → `deploy` (the last two are skipped on PRs)
- `CI / validate` is the required branch protection check — keep both the workflow name (`CI`) and job name (`validate`) unchanged
- The PDF is generated in CI and served via GitHub Pages; it is **not** committed to the repo (`resume.pdf` is gitignored)
- Shared Puppeteer config (launch args, PDF options) lives in `.github/scripts/puppeteer-config.js` — edit there, not in individual scripts
- Shared CI setup (Node, Puppeteer install, HTTP server) is a composite action in `.github/actions/puppeteer-server/`

## Workflow
- Always review changes locally before committing or pushing
- Commit logical groups of changes together with clear messages
