# Pre-release test checklist

Use two disposable, confirmed accounts and fictional plans. Check off only observed results; this list is not a record that every check passed.

## Authentication and isolation

- [ ] Sign up and open the confirmation in the requesting tab; sign in successfully.
- [ ] Wrong password displays an accessible error; signed-out account route redirects to login.
- [ ] Request reset, open it in the requesting tab, change password, then sign in with the new password. Test expired/different-tab links.
- [ ] Sign out; refresh and back navigation must not reveal account plans.
- [ ] Create/edit/complete/delete, reload, then verify on another device.
- [ ] Sign in as account B: none of account A's plans appear.
- [ ] Export before testing account deletion. Verify the account and plans are removed and refresh tokens no longer work.
- [ ] After provider setup, test Apple and Google success, cancellation, hidden email, and sign-out.

## Failure and data handling

- [ ] Offline save shows “Not saved,” retains edits for export, and retries after reconnecting.
- [ ] Two tabs with the same account: stale revision rejects overwrite. Export before reloading.
- [ ] Local migration requires confirmation; failed save retains the local copy; retry does not duplicate it.
- [ ] Valid ICS round trip: export a calendar file, then import it into a clean planner. New events appear; duplicates are skipped and counted; all-day and invalid events are skipped, not silently changed.
- [ ] Calendar (.ics) exports contain only intended event fields; inspect floating time zone behavior. Tasks are not in .ics files, and Preferences offers ICS import/export only.
- [ ] 1,000-item limits, invalid dates, reversed times and overlap notices behave correctly.

## Safari, iPadOS and accessibility

- [ ] Safari on macOS: complete all core flows with keyboard only. Visible focus, logical order, Escape closes dialogs, focus returns sensibly.
- [ ] VoiceOver on macOS and iPad: labels, headings, status/error announcements, date/time controls and modal focus work.
- [ ] At 200% text/zoom: no clipped content or unreachable controls. Test narrow portrait and landscape iPad layouts, touch and external keyboard.
- [ ] Light/Dark Mode: readable text, fields, errors, category labels and focus. Solid mode remains readable in both. Specifically check callout text, welcome text, and the skip link in Dark Mode — callout text was 1.1:1 before this fix.
- [ ] Reduce Motion and solid mode suppress decorative animation; no flashing or autoplay.
- [ ] Touch controls have adequate target sizes; do not rely on color alone.
- [ ] Privacy/terms accurately match storage, providers, retention and account deletion.

## Release

- [ ] Run `npm ci`, `npm test`, `npm run vendor`, syntax checks and `git diff --check`.
- [ ] Run `tests/rls.sql` against the intended project; it rolls back its fixtures.
- [ ] Check Supabase security advisors and all changed files for secrets.
- [ ] Complete SMTP and provider setup or explicitly retain pending labels.
- [ ] Review the PR; merge only when the intended release scope passes. Verify Pages deployment and production callbacks afterward.

No WCAG certification, Apple approval, GDPR, CCPA or FERPA compliance is asserted. Real-device and legal/privacy reviews remain separate release requirements.
