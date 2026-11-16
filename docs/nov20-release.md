# November 20 acceptance sprint

Deadline: Friday November 20, 2026, 5 PM America/New_York. Presentation: Monday November 23. Feature work is on `feat/nov20-account-recovery-profile`, not deployed to production.

| Work | Owner | Due | Tracking |
| --- | --- | --- | --- |
| Recovery page, profile editor, shared header | fakhrushaik | Nov 18 | #47 |
| Privacy review and disposable-account cleanup | hoube142 (Bonnie) | Nov 19 | #48 |
| SMTP provider and release configuration | Bilal456-rgb | Nov 19; provider decision Nov 17 | #49, existing #39 |
| Schema and account lifecycle review | cj04c (backend contributor) | Nov 19 | #50 |
| Acceptance, freeze and rehearsal | fakhrushaik with team | Nov 20 | #51 |

The existing project and original roadmap dates are preserved. OAuth #41, remote push, new calendar integrations and new AI features are not part of this sprint. Do not label pending external-email or cloud-browser tests as complete.

## Release order

1. Review the PR. Apply `supabase/migrations/20261116203242_private_account_details.sql` to an isolated staging database first. It adds a separate owner-only table, no public profiles or storage bucket. No hosted migration was applied during implementation.
2. Test owner CRUD, other-user and anonymous denial, optional DOB removal, avatar removal, and account cascade. The local PostgreSQL-compatible test passed; hosted API and browser acceptance remain a release gate.
3. Configure SMTP and redirects below. Test on a preview using the same approved origin. A branch alone is not a hosted preview.
4. Complete #48/#50/#51 and PR review before merge or Pages publication. No production deployment is authorized by this PR.
5. If acceptance fails, retain the existing production version. The additive account-details table may remain unused; do not drop it once real data exists without a retention/export decision.

## Email recovery configuration

The new request and password forms live at `reset-password.html`. Legacy `login.html?flow=recovery` links forward without consuming the authorization code. A valid recovery exchange is required; a signed-in session or query flag alone is insufficient. Passwords must match and have at least 12 characters. After success the flow attempts global sign-out and tells the user if sign-out fails.

The default PKCE flow retains tab-scoped sessions. Users must open the link in the requesting tab. Wrong-tab, expired and reused links show a new-request path. No persistent refresh-token storage was added.

Before deploying, add these exact URLs to Supabase Authentication > URL Configuration; keep existing login URLs:

```
https://fakhrushaik.github.io/Smart-AI-Planner/reset-password.html
http://localhost:4173/reset-password.html
http://127.0.0.1:4173/reset-password.html
```

Add an exact preview URL only after choosing the actual preview host. Avoid broad wildcards. Keep the standard recovery email `{{ .ConfirmationURL }}` for PKCE. The page also supports `token_hash` with `type=recovery` for a separately reviewed custom recovery template, but **no email template was changed**. Do not advertise cross-tab recovery until that template and its full lifecycle have been verified. Recovery URLs are removed from the address bar immediately, and the page sends no referrer.

SMTP requires the owner/provider's host, port, username, password/API credential, verified sender address and verified domain/DNS where required. Enter secrets directly in Supabase Authentication > Email > SMTP, never repository files, issues, chat or screenshots. Preserve email confirmation and password protections. Disable mail-provider click tracking on auth links. Check provider quotas, spam delivery and Supabase rate limits. No provider purchase, credentials, DNS changes or SMTP configuration were supplied or performed in this task.

Acceptance: use an authorized disposable address outside the team; request once, receive email, open valid link, reject mismatched/short password, update, sign in with the new password, reject the old password, reject replay/expiry and handle another-tab opening. Record only redacted outcomes. A mocked test or accepted email request does not prove inbox delivery.

References: [Supabase password reset](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [redirects](https://supabase.com/docs/guides/auth/redirect-urls).

## Profile privacy

`account_details` stores display name, a maximum 64 KiB JPEG avatar and optional date of birth. Row-level security restricts reads and mutations to `auth.uid() = id`, including prevention of owner changes. DOB is not Auth metadata and therefore is not included in JWT claims. The header only selects name/avatar; settings fetches DOB. There is no new localStorage/sessionStorage profile cache, analytics or external avatar host.

DOB is unnecessary for planning. It defaults to absent, requires an explicit save-consent checkbox, and is cleared by blanking the date or unchecking consent and saving. The form rejects impossible/future dates; the database enforces date bounds. This is application access control, not field-level encryption. Administrators with database privileges can access the field; Supabase backup retention can outlive a row deletion. Do not use real birthdays in testing or promise immediate removal from backups.

Uploads accept JPG/PNG/WebP up to 5 MB, decode and crop to a 128px JPEG, and discard original file metadata. External URLs and SVGs are rejected. Photos are stored under the same owner-only policy, not in a public bucket. Account deletion cascades to these details. Clearing planner events/tasks intentionally does not clear the profile; settings provides profile removal controls and account deletion.

## Test-account administration

Use the local demo for presentations whenever cloud identity is unnecessary. If testing accounts, use team-controlled disposable aliases and fictional plans, names and DOBs. Get the tester's agreement and set a deletion date, normally immediately after acceptance or Nov 23 rehearsal. Keep any address/UUID inventory privately with administrators, not on this public board.

Create accounts through normal confirmed signup after SMTP is ready, or an authorized administrator can add a disposable user in Supabase Authentication > Users for tests that do not claim to test signup delivery. Do not disable confirmation globally. Never add a service-role key to this static site. Restrict Supabase project access to the existing authorized team.

Preferred cleanup: the tester signs in to their disposable account, exports if needed, opens Settings > Delete account, and confirms the existing destructive action. The existing server RPC validates a live session, deletes owned planner rows, revokes sessions and removes Auth identity. The new account-details table cascades from Auth. Do not execute this against a teammate's real account.

Admin fallback: identify one exact disposable UUID and verified email in the dashboard; revoke/ban sessions as appropriate and inspect dependencies before deletion. The live database includes `profiles_OLD`, `tasks_OLD`, `eventsnew`, and `tasksnew` in addition to the current planner schema. Their foreign keys and owner-checking row triggers can prevent an administrative delete or leave a cleanup obligation. A backend owner must inspect the current schema and test a transaction on staging; do not blindly run `delete auth.users` or bulk delete by email/domain. If deletion fails, stop and keep the identity restricted while resolving owned rows through a reviewed procedure. #50 tracks this gate.

Verify the disposable Auth UUID is absent, its profile/current and legacy records and any Storage objects are absent, fresh sign-in/refresh fails, and no remaining user data is accessible. Existing access JWTs may survive until expiry; deletion is not a promise of instant token invalidation. Downloaded exports, provider mail and browser copies require separate deletion. Record only a redacted result and timestamp.

## Findings outside this patch

Read-only live inspection found two newer tables (`eventsnew`, `tasksnew`) with RLS but no policies (access denied, not public exposure), six legacy functions with mutable search paths, and leaked-password protection disabled. Do not grant broad policies merely to silence advisors. Review with #50; the existing documentation records plan restrictions for leaked-password protection. These were not modified in production.

## Validation record — November 16

- Existing and new unit tests: 9 passed (planner validation, recovery intent/exchange failures/replay, DOB and avatar validation).
- Local PostgreSQL-compatible migration test: owner CRUD, cross-user read/write denial, owner-transfer denial, anonymous denial, DOB clearing/future constraint, avatar constraint and Auth cascade passed.
- Profile form tests passed for consent, clearing, safe rendering, failed-save feedback and sign-out icon removal.
- JavaScript syntax checks passed.
- Local recovery page rendered; invalid-link message, callback parameter removal, and legacy recovery redirect verified in browser. Mobile recovery/settings checked at 390px; settings had no horizontal overflow.
- Hosted SMTP inbox delivery, authenticated profile save/reload in a deployed preview and live account deletion are **not verified**. They require configuration/staging and disposable fixtures, not a teammate's live account.
