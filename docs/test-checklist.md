# Test checklist — login, dark mode, animations

Run this locally before the sprint review. Local run: `python3 -m http.server 4173 --directory website`, then visit http://localhost:4173.

## As a senior developer

- [ ] `node --check website/login.js` and `node --check website/planner.js` pass.
- [ ] No new network request: Content Security Policy still has `connect-src 'none'` in the preview, and no remote font, script, or tracker was added.
- [ ] No secret in the repo: search for `password` outside the clearly labelled demo callout and login demo code, and for any Supabase key. There must be none.
- [ ] Login demo is local only: `sessionStorage`, not `localStorage`, and sign-out clears it. Planner data is still browser-local unless device saving is turned on.
- [ ] Dark Mode does not break solid mode: turn solid mode on, then switch the system to dark. Solid mode must stay light and solid.

## As a rigorous tester

Login:
- [ ] Wrong username or password shows a clear error and does not redirect.
- [ ] Empty username or password shows a clear error.
- [ ] `user` / `password` redirects to `planner.html#today` and shows "Good morning / afternoon / evening, user."
- [ ] Dismissing the welcome banner hides it. Signing out shows "Guest preview" in the top bar.
- [ ] Apple and Google buttons are disabled, say "Coming soon", and do nothing when clicked.
- [ ] Show password toggles the field and updates its label. Keyboard Tab order goes username → password → Sign in.
- [ ] Guest link from login and from the home page still opens the planner without signing in.

Dark Mode:
- [ ] System dark: background is near-black, body text is readable, primary buttons are deep purple with white text (not pastel), top bar is dark and translucent, and category chips are readable.
- [ ] System light: no regression — pastel chips, purple buttons, and paper background look as before.
- [ ] Form errors and Delete buttons are readable in both modes.

Animations:
- [ ] Home hero and feature cards rise gently on load. Planner welcome rises once after sign-in.
- [ ] With system Reduce Motion on, no rise, hover lift, or transition animation plays.
- [ ] With solid mode on, hero, feature, welcome, and login animations are off.
- [ ] No flashing, auto-play, or animation that blocks reading or clicking.

Planner regression:
- [ ] Add event from a calendar day prefill its date. End before start is rejected. Overlap shows a notice.
- [ ] Task complete, search, filter, week navigation, sample day, JSON export, .ics export, JSON import, and delete with confirmation still work.

## As a potential consumer

- [ ] In 30 seconds I can tell: what the app does, that sign-in is a demo, that Apple/Google are coming soon, and that my plans stay in this browser.
- [ ] I am never asked for a real Apple, Google, university, or email password.
- [ ] The home page status section is honest: Available now / Demo / Coming soon, with no fake testimonials, ratings, or AI claims.
- [ ] Privacy page explains demo sign-in, local storage, exports, and that browser storage is not an encrypted vault.
- [ ] On a phone (375px) the login card, header, and planner top bar do not overflow, and buttons are at least 44px tall.

## Known limits — say these in the review

- Demo login is not security. Anyone can use `user` / `password` on the public preview.
- No real accounts, sync, AI, reminders, or Apple/Google sign-in yet. Those need Supabase (see `docs/supabase-prompts.md`).
- No WCAG, Apple, GDPR, CCPA, or FERPA certification is claimed. Real-device Safari, VoiceOver, and a privacy review are still needed.
