# Supabase account preview — October 26, 2026

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
