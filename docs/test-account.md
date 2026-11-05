# Test account — for Team 59 only, not for public sign-up

Public users do not get a sample-data button any more. The "Add example week" button and its handler were removed from the planner, the Today guidance, and Settings. Sample plans now live only in a test account that the team creates and hands out on request, via the Contact page (currently a 404-style placeholder saying the page is still being built).

## What was NOT done by Muse, and why

Muse did not create a test user in Supabase from this chat, and did not invent a password. Creating a Supabase auth user needs admin access (dashboard or service-role / MCP), a real email address, and a password chosen by the team — none of which were supplied here, and a password must never be shared in chat or committed to the repo. The team member with Supabase open should create the account as below, then tell testers the email and password out of band, not in the repo.

## Create the test user (Supabase dashboard, 2 minutes)

1. In Supabase, open Authentication > Users > Add user.
2. Choose an email the team controls for testing, for example a team test mailbox. Do not use a real student's university email.
3. Set a strong, unique password, and check the option to confirm the email immediately ("Auto Confirm User" / email confirmed). This matters because custom SMTP is not configured (open issue #39), so a normal sign-up confirmation email may not arrive.
4. Save, then sign in at the planner login page with that email and password to confirm it works.
5. Rotate or delete the test account when testing is done. Never use it for real plans.

The same steps can be done with Supabase MCP in VS Code, if that connection is used instead of the dashboard. Do not paste a service-role key into the website, into chat, or into the repo.

## Seed the test account with sample plans (starting today)

Sign in as the test user in the planner, then add these plans by hand, starting from the day you open the site — not from a fixed October date:

- Today, 09:00–09:50, Class, Database Systems, Campus classroom
- Tomorrow, 14:00–17:00, Work, Campus café shift, Campus café
- Day 3, 11:00–12:30, Class, Software design lab, Computer lab
- Day 4, 15:00–16:00, Focus, Finish SQL lab, Library
- Day 6, 13:00–14:00, Personal, Downtime with friends, Campus green

Tasks:

- Day 5, Class, SQL lab deadline
- Day 6, Personal, Plan a little downtime

All of these are fictional. Testers should use fictional plans only, and should not enter passwords, health, financial, or confidential student records.

## What testers get

- A signed-in account with the sample plans above, so they can try the calendar, tasks, export (.ics), and Settings without starting from an empty planner.
- No public sample button, no sample data in the guest demo, and no sample data in the repo's website code.
- If a tester asks for an account, a Team 59 member creates or reuses this test account and shares the credentials out of band. The Contact page does not collect or deliver requests yet.

## Notifications check (Safari)

If notifications do not appear, check in this order, in Planner > Settings > Notifications, where a diagnostic line now shows support, permission, and secure-context status:

1. Is permission "granted"? If it is "denied", Safari will not ask again. Change it in Safari Settings > Websites > Notifications, and in System Settings > Notifications > Safari, then reload.
2. Is Focus / Do Not Disturb on? A test notification may be held or grouped under Safari, not Smart Planner, unless the site is added as a web app.
3. Is the page on localhost or https? Notifications need a secure context.
4. Remote push when the tab is closed is still not included. Reminders work only while the planner is open, for events starting in the next 15 minutes.
