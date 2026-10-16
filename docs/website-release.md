# Static website release

The `website/` directory implements the supplied Smart AI Planner PNG as a responsive static website. The GitHub Actions Pages workflow publishes only that directory; SQL files, project contracts, and other repository files are not included in the website artifact.

## Working features

- Landing, about, privacy, accessibility, terms, and custom 404 pages.
- Event creation/editing/deletion with date and time validation, overlap notice, weekly calendar.
- Tasks with completion, search, filtering, and editing.
- Memory-only planner by default, opt-in local storage, JSON and iCalendar exports, deletion confirmation.
- Solid display mode, semantic controls, visible keyboard focus, no animations, reduced-motion and contrast media queries.

Accounts, AI, live calendar synchronization, push notifications, widgets, and native Apple apps are not implemented or simulated as connected services. JSON export is not an import/restore feature. iCalendar times are floating local times; users must check the destination calendar timezone.

## Verification performed (October 16, 2026)

- JavaScript syntax checks (`node --check`) passed for both scripts.
- Local HTML asset/link and duplicate-ID checks passed for all seven HTML pages.
- Browser checks: event creation, invalid end-time rejection, task creation/completion, task search, save/reload persistence, turning saving off/reload, JSON download contents, iCalendar download contents, and solid-mode toggle.
- Calendar at 375px viewport: document width and scroll width both 375px; vertically stacked days.
- Codex Security scoped static review covers `website/`; its canonical report is retained by the plugin rather than published with the website.
- Workflow action commit pins verified against GitHub tag references. Deployment grants contents-read plus Pages-write and OIDC only to its deploy job.

## Remaining validation and limits

This is not a certification of WCAG, Apple App Store, GDPR, CCPA, FERPA, or other legal compliance. Real-device Safari, iPadOS, VoiceOver, user testing, a full accessibility audit, and jurisdiction-specific legal review remain necessary for a production service. A dedicated origin is recommended before handling sensitive plans because GitHub project sites on one hostname share localStorage authority.

Meta CSP cannot supply response-only frame-ancestors protection. GitHub Pages response headers are hosting-controlled. There are no remote data inputs, APIs, credentials, tracking scripts, or account sessions in this preview. Browser storage is not an encrypted vault, and other open tabs/exported files retain independent copies.

## Local development

Run `python3 -m http.server 4173 --directory website`, then visit http://localhost:4173. Use the GitHub Pages project URL to test the custom 404 page's repository-prefixed paths.

## Deployment

`.github/workflows/pages.yml` uploads only `website/` and deploys to GitHub Pages after relevant pushes to `main`, or through a manual workflow dispatch. No build or runtime package dependencies are required. Do not put secrets or private data under `website/`.
