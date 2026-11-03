# Supabase account preview — October 26, 2026

## Update — November 2, 2026: Bento Settings, clock, dynamic examples, no sample button, custom 404, Contact placeholder

Settings is now a bento grid: Profile, Appearance, Time & timezone, Notifications, AI assistant, Privacy & data, Accessibility, and Delete account, using the existing palette, 14px gutters, and 32px tiles. A date/time clock with timezone is shown in the header of every page and in the planner top bar, updating every 30 seconds. Example previews on the bento and home pages now show today's date, not a fixed October 5 date, and examples start from the day the site is opened. The "Add example week" button and its handler were removed from everywhere; sample plans now live only in a team test account, on request via Contact (see docs/test-account.md). Notifications were checked: Settings now shows a diagnostic line (support, permission, secure context) and explains the Safari denied-permission case, where Safari will not ask again and the setting must be changed in Safari Settings > Websites > Notifications and System Settings > Notifications > Safari. Remote push when the tab is closed is still not included. A custom, palette-matched 404 page ("This page took a wrong turn") is now in place, with bento tiles back to Bento, Home, Planner, and Contact. Contact is a 404-style placeholder saying the page is still being built; its form is disabled and sends nothing.

## Update — November 2, 2026: Theme toggle, Settings, notifications, BYO AI, Bento on every page

Preferences is now Settings in the planner. Settings adds Light / Dark / System theme (also a sun/moon button at the top of every page, saved on this device only), a Notifications panel (permission, test notification, and reminders while the planner is open for events starting in the next 15 minutes), and a bring-your-own-key AI panel (ChatGPT and Claude; Siri has no web API and is not offered as a key option). Remote push when the tab is closed is not included — it needs a service worker, VAPID keys, and a Supabase Edge Function, and Supabase does not send browser push on its own. Every page now has a Bento link in its header and footer, and the planner sidebar, so you can return to the bento entry from anywhere.

## Update — November 2, 2026: Apple bento entry, Get In to homepage

`website/index.html` is now an Apple-style bento entry: a 4-column desktop grid, 14px gutters, 32px tiles, hero tile 2×2, with staggered pop-in animations, existing palette and system fonts only, and no new colours or external icons. The purple Get In tile links to `website/home.html`, which is the previous homepage preserved unchanged apart from its brand links. Internal Home/brand links in about, privacy, accessibility, terms, login, and planner now go to `home.html`, so once inside the site you stay inside; the bento remains the root entry at `index.html`. Coming-next items are marked Coming soon and are not working buttons. Animations are off for reduced motion and solid mode.

## Update — October 26, 2026: ICS-only Preferences, dark readability, alignment

Preferences now offers calendar (.ics) import and export only. JSON file import/export was removed from Preferences. ICS imports add new events, skip duplicates, all-day, and invalid events, and do not include tasks. Dark-mode callout text was fixed (it was 1.1:1 contrast), as were the skip link, welcome text, and feature-card, schedule-item, and task-row alignment.

This branch replaces the browser-checked demo login with Supabase email/password authentication. Apple and Google remain on hold. Only `website/` is published by the Pages workflow; pushing this branch does not deploy main.

## Implemented

Email signup/sign-in, PKCE confirmation/recovery handling, global sign-out, account-route guard, and a personalized greeting. Sessions use tab storage (memory fallback if unavailable); observed access-token lifetime is 3,600 seconds. Sign-out revokes refresh sessions; issued access tokens can outlive sign-out until expiry.

Signed-in profiles, events and tasks use Supabase with ownership RLS. Snapshot writes are transactional and revision checked. Direct mutations also enforce per-user limits. Local demo remains available without an account. Local migration and JSON replacement require confirmation. Failed saves retain edits and show retry/export/reload controls. Account deletion requires a live session and removes the caller's plans, profile and auth account.

Login spacing, button alignment, responsive wrapping and empty-status spacing were improved. Existing solid mode, dark mode and reduced-motion support remain. Fictional sample week and first-run guidance are included.

## Verified

- Four automated data-validation/escaping tests pass; JavaScript syntax and whitespace checks pass.
- Applied migration and SQL isolation tests: own operations, cross-user read/write/delete denial, owner reassignment denial, stale revision rejection and anonymous denial.
- Live APIs: invalid credentials rejected; anonymous table access denied; confirmed disposable fixture can sign in, create profile, save/reload events/tasks and complete a task. Authenticated account deletion succeeded and subsequent sign-in was denied. Fixture cleanup completed.
- A live API stale-save assertion did not return the expected error code; SQL stale-revision test passes. Browser conflict/retry behavior needs further review before production. Do not describe the full API test as passing.
- Local browser: signed-out account guard redirects, signup form fields, guest planner/sample calendar and dark login alignment inspected.
- Existing production guest preview: sample plans, device-save/reload, event edits and invalid-time validation, task create/complete/search, calendar, export controls and solid mode checked.
- Codex Security scan `43e783a2-04d1-4612-9d49-9c2927494e8d` completed with no reported findings across its 16-source-file inventory. It covers the original snapshot, not later layout/copy edits; full upstream SDK audit excluded. This is not a security certification.

## Remaining setup and release gates

Email confirmation remains enabled by the owner's choice. **Custom SMTP is not configured. External reviewers cannot reliably complete email signup or password recovery until mail delivery is configured.** Use confirmed authorized test accounts or local demo for review. No email verification bypass was enabled.

Supabase's leaked-password protection warning remains: this feature requires a paid plan. Minimum password length is 12; secure email/password change are enabled. Exact redirect URLs and provider setup are in [supabase-setup.md](supabase-setup.md).

Google/Apple, real-device iPadOS/VoiceOver, full keyboard/200% checks, email confirmation/recovery delivery, and production rollout still require validation. No WCAG, Apple, GDPR, CCPA or FERPA certification is claimed. Browser storage shares the GitHub hostname origin; use a dedicated origin before sensitive production data. Exported files, other tabs and provider backups/logs are separate from app deletion.

## Development and deployment

Run `npm ci && npm test`. The pinned Supabase SDK is locally bundled with `npm run vendor`; commit the bundle and lockfile. Serve with `python3 -m http.server 4173 --directory website`. Public URL/key live in `website/config.js`; never commit service-role, SMTP, OAuth or database secrets.

Review and merge into main only after intended release checks pass. Pages deploys `website/` on main changes. See [test-checklist.md](test-checklist.md) and [sprint-review.md](sprint-review.md).
