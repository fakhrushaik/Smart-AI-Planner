# Sprint review — Monday, October 26, 2026

Use fictional plans. This branch is an account preview for review, not a claim of production readiness. The existing public site changes only after the PR is merged.

1. **Home, 30 seconds:** show who this is for, the local/account distinction, and the honest feature status cards.
2. **Local demo, 90 seconds:** choose “Try local demo,” visit Preferences, add the example student week, and open Calendar. The labeled examples cover classes, a café shift, a lab deadline and downtime.
3. **Editing, 60 seconds:** add an event using a day's + button, try an invalid end time, then correct it. Add and complete a task. Search/filter the task list.
4. **Data controls, 60 seconds:** export a calendar (.ics) file, import a calendar (.ics) file and show new events added with duplicates skipped, and show deletion confirmation. Tasks are not in .ics files. Local saving is optional. Signed-in saves go to Supabase; failed saves say “Not saved” and provide retry/export/reload options.
5. **Account preview, 60 seconds:** use a separately prepared, confirmed test account. Show the personalized greeting and save/reload persistence. Sign out and show that the account route returns to login. Never show credentials on a slide or commit them.
6. **Limits, 30 seconds:** Apple/Google await owner credentials; AI, live calendar connections and notifications are planned. Explain that a static website is not an approved native Apple app, and accessibility/privacy review is still required.

If email delivery or account setup is not ready, demonstrate the explicitly labeled local mode and show the database isolation test results. Do not present an untested account flow as passing.

Local run: `python3 -m http.server 4173 --directory website`, then visit `http://localhost:4173`. See [setup](supabase-setup.md), [release evidence](website-release.md), and [manual checklist](test-checklist.md).
