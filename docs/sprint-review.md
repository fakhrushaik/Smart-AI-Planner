# Sprint review — Monday, October 26, 2026

Five-minute demo flow for the project advisor. This is a student preview, not a production service.

## 1. Home (30 seconds)

Open `index.html`. Note the calm, pastel look, the day-at-a-glance card, and the plain statement: no account, no tracking, everything stays in this browser.

## 2. Sample day (1 minute)

Open the planner, go to Preferences, and choose "Add sample plans." Return to Today: three events, scheduled time, and tasks to work on appear, with overdue tasks sorted first.

## 3. Make it work (2 minutes)

- Add an event from a calendar day using the + button on that day; the date is already filled in.
- Edit it, then try an end time before the start time to show validation and the overlap notice.
- Complete a task, search and filter tasks, and move a week forward and back.

## 4. Data control (1 minute)

In Preferences: export JSON, export a calendar (.ics) file, import a previously exported JSON file, and delete planner data with confirmation. Device saving is off by default and opt-in only.

## 5. Privacy and limits — say these out loud

- No accounts, AI requests, live calendar sync, push notifications, tracking scripts, remote fonts, or third-party scripts are active in this preview.
- Browser storage is not an encrypted vault. Do not enter passwords, health records, financial information, or other confidential student records.
- This preview does not claim WCAG certification, Apple App Store approval, or GDPR, CCPA, or FERPA compliance. Real-device Safari, VoiceOver, and a full accessibility audit remain to be done before any production use.
- A dedicated origin is recommended before handling sensitive plans, because GitHub project sites on one hostname share localStorage authority.

## What changed October 24, 2026

- Apple Human Interface Guidelines polish: sticky translucent headers, pill buttons, larger card radii, softer depth, system type only, and Dark Mode that respects the existing accessible solid mode.
- JSON import/restore with validation and field filtering, local only, with a replace confirmation.
- Calendar day + buttons that prefill the event date, and Today tasks sorted by date so overdue work is not buried.
- Privacy notice updated for import. No new network requests were added.

## Local run

Run `python3 -m http.server 4173 --directory website`, then visit http://localhost:4173.
