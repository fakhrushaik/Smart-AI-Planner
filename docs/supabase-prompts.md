# Supabase prompts for ChatGPT

Copy one prompt at a time into ChatGPT. ChatGPT is already connected to this GitHub repository and to Supabase, so ask it to work in a branch and open a pull request for review — never push straight to main, and never paste secrets into a prompt, a commit, or a public file.

## Context to use in every prompt

- Repo: fakhrushaik/Smart-AI-Planner. Only `website/` is published by GitHub Pages. There is no build step, no bundler, and no backend yet.
- Front end: plain HTML, CSS, and JavaScript in `website/` (`index.html`, `login.html`, `planner.html`, `planner.js`, `login.js`, `preferences.js`, `styles.css`). No remote fonts, trackers, or third-party scripts today, and the Content Security Policy blocks external connections.
- Current login is a local demo only: a hardcoded demo account, checked in the browser, stored only as a tab session. It is not security and must be removed when real auth lands.
- Planner data today: events (title, date, start, end, category, location) and tasks (title, date, category, done), stored in the browser only, with JSON and .ics export and JSON import.
- Rules: do not claim Apple, Google, WCAG, GDPR, CCPA, or FERPA compliance. Do not store passwords, health records, financial data, or student records. Do not put a Supabase service-role key, or any secret, in front-end code or in the repo.

---

## Prompt 1 — Set up Supabase Auth and the database

> In the Smart-AI-Planner repo, set up Supabase for the static site in `website/`.
>
> 1. Create the Supabase tables `profiles` (id, email, display_name, created_at), `events` (id, user_id, title, date, start_time, end_time, category, location, created_at, updated_at), and `tasks` (id, user_id, title, date, category, done, created_at, updated_at).
> 2. Turn on Row Level Security on every table and write policies so a signed-in user can only select, insert, update, and delete their own rows, where `user_id = auth.uid()`.
> 3. Enable email/password auth, Google auth, and Apple auth in Supabase Auth, and list exactly which redirect URLs, Apple Service ID, and Google OAuth client settings I still have to finish by hand in Apple Developer and Google Cloud, with step-by-step instructions.
> 4. Tell me which Supabase URL and anon key to use in the front end, and where they must live so they are not committed as secrets. The anon key is public by design; the service-role key must never appear in the browser.
>
> Acceptance: a test user can sign up, sign in, sign out, and cannot read another user's events or tasks in a SQL check. Open a pull request, do not push to main.

## Prompt 2 — Replace the demo login with real Supabase Auth

> Replace the demo login in `website/login.html` and `website/login.js` with real Supabase Auth, keeping the same calm Apple-style look and the same pages.
>
> 1. Remove the hardcoded demo account (the former hardcoded account) completely. No demo password may remain in code, comments, or docs.
> 2. Wire up email/password sign-in and sign-up, password reset, sign-out, and a session check on `planner.html` that redirects signed-out users to `login.html`.
> 3. Wire up the Apple and Google buttons so they actually start Supabase OAuth and handle the callback, instead of being disabled "Coming soon" buttons.
> 4. Keep the welcome greeting after sign-in, using the signed-in user's display name or email, with the same gentle animation, and respect `prefers-reduced-motion`.
> 5. Update `website/privacy.html` and `docs/website-release.md` to describe what Supabase stores, how long sessions last, and how a user deletes their account data.
>
> Acceptance: wrong passwords show a clear error, Apple/Google buttons no longer look fake, sign-out really ends the session, and no secrets are committed. Open a pull request for review.

## Prompt 3 — Sync planner data to Supabase

> Make the planner in `website/planner.js` save to Supabase instead of only to the browser, without breaking the existing demo flow.
>
> 1. On sign-in, load that user's events and tasks from Supabase and render them in Today, Calendar, and Tasks.
> 2. Make add, edit, complete, and delete write through to Supabase, with validation on the client (title required, end after start, date in range, max 1,000 events and 1,000 tasks) and a clear error message if a save fails.
> 3. Keep .ics export and .ics import working in Preferences — JSON file import/export is out of scope there — and add a one-time migration: if a signed-in user already has browser-local plans, offer to import them into Supabase once, then clear the local copy only after a successful save.
> 4. Handle offline or failed saves honestly: tell the user the change is not saved yet and do not pretend it synced.
>
> Acceptance: create an event on one device, reload, and it is still there; sign in as a different user and the first user's plans are not visible. Open a pull request.

## Prompt 4 — Security, privacy, and release checklist

> Audit the Smart-AI-Planner Supabase setup as a senior developer and a security reviewer.
>
> 1. Check Row Level Security, auth settings, password policy, email confirmation, and redirect URLs. List any policy that would let one user read or change another user's data.
> 2. Check the front end for secrets, hardcoded credentials, simulated Apple/Google sign-in, tracking scripts, and any claim of GDPR, CCPA, FERPA, WCAG, or Apple compliance that is not true.
> 3. Update the Content Security Policy for Supabase only if needed, and explain every new external connection. Do not add analytics, ads, or remote fonts without asking first.
> 4. Give me a pre-release checklist for the advisor review: what to test in Safari on macOS and iOS, in Dark Mode, with VoiceOver, with a keyboard only, at 200% text size, and with reduced motion on.
>
> Acceptance: a written list of findings, fixes in a pull request, and no secret or fake feature left in the code.

## Prompt 5 — Make the site look like a real product, without faking features

> Improve the content of the Smart-AI-Planner site so it looks like a real student product, without inventing users, testimonials, ratings, or features that do not exist.
>
> 1. Rewrite the home page to show, in plain language: who it is for (University of Cincinnati students balancing classes, work, and activities), what works today, what is coming next, and what data stays local versus what Supabase will store.
> 2. Add a realistic example week for a student — classes, a work shift, a lab deadline, and downtime — clearly labelled as an example, using the existing sample-day feature.
> 3. Add an empty-state and first-run guide in the planner: what to do first, how to add an event, how to export, and how to delete data.
> 4. Keep the tone calm and student-friendly, keep every status label honest (Available now / Demo / Coming soon), and do not add fake logos, fake reviews, or fake "AI" claims.
>
> Acceptance: a visitor can tell in 30 seconds what the app does, what is real, and what is planned. Open a pull request.

---

## After ChatGPT finishes

- Review the pull request, check for secrets with `git diff`, and test sign-in, sign-out, Google, Apple, sync, and sign-out on a second account.
- Only then merge to main. GitHub Pages will publish `website/` after the merge; docs in `docs/` will not appear on the live site, by design.
- Before any real student data is used, get a privacy review for FERPA and university data rules, and update the privacy notice for Supabase hosting, retention, and deletion.
