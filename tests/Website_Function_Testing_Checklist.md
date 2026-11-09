# Smart AI Planner Website & Function Testing Checklist

# 1. Basic Website Navigation

- [x] Open the Smart Planner landing/features page.
- [x] Open the Home page.
- [x] Open the Planner as a guest/local demo.
- [x] Open the Sign In page.
- [x] Open the Our Story page.
- [x] Open the Privacy page.
- [x] Open the Accessibility page.
- [x] Open the Terms page.
- [x] Open the Contact page.
- [x] Confirm the menu opens and closes correctly.
- [x] Confirm all visible navigation links go to the expected page.
- [x] Confirm footer links work.
- [x] Confirm the Smart Planner logo returns the user to the landing page.
- [x] Try a nonexistent page and confirm the custom 404 page appears.
- [x] Confirm the 404 page provides working links back to the site.
- [x] Confirm unfinished features/pages are clearly identified as unfinished.

---

# 2. Account Creation

## Valid Account

- [x] Open Sign In.
- [x] Select **Create account**.
- [x] Confirm the account-creation form appears correctly.
- [x] Confirm Display Name is optional.
- [x] Enter a display name.
- [x] Enter a valid test email.
- [x] Enter a password containing at least 12 characters.
- [x] Submit the account.
- [x] Confirm an understandable success/confirmation message appears.
- [FAIL] Confirm the confirmation email is received.
        - I'm not recieving a confirmation email from supabase 
- [ ] Confirm the email-confirmation link returns to Smart Planner correctly.
- [ ] Sign in with the newly created account.
- [ ] Confirm the correct display name/email appears after sign-in.

## Invalid Account Information

- [x] Try to create an account with the email field empty.
- [x] Try to create an account with the password field empty.
- [x] Enter an invalid email format.
- [x] Enter a password shorter than 12 characters.
- [ ] Test the maximum Display Name length.
- [ ] Try creating a second account using the same email.
- [ ] Confirm errors are understandable.
- [ ] Confirm errors do not expose raw internal/server information.
- [ ] Confirm repeated clicks do not create duplicate submissions.
- [ ] Confirm the password field is cleared appropriately after submission.

## Password Requirement Verification

- [x] Confirm the website requires at least 12 characters during account creation.
- [FAIL] Confirm the password-reset flow also requires at least 12 characters.
- [ ] Verify the Supabase authentication configuration matches the password policy shown by the website.
- [ ] Confirm the website does not encourage reuse of a university password.

---
 
# 3. Sign-In

- [ ] Sign in with a valid account.
- [ ] Confirm the Planner loads successfully.
- [ ] Confirm the correct account name/email is shown.
- [ ] Refresh the page and confirm expected session behavior.
- [ ] Enter an incorrect password.
- [ ] Confirm an understandable error appears.
- [ ] Try an email that is not registered.
- [ ] Confirm the response does not unnecessarily reveal account information.
- [ ] Attempt to open the signed-in Planner directly while signed out.
- [ ] Confirm the user is redirected to Sign In.
- [ ] Confirm `planner.html?guest=1` remains available without an account.

---

# 4. Password Visibility and Reset

## Show / Hide Password

- [x] Confirm the password becomes visible.
- [x] Confirm the button changes to **Hide password**.
- [x] Confirm the password is hidden again.
- [x] Confirm the control works with keyboard input.

## Password Reset

- [x] Select **Forgot password?** and Confirm the form changes to password-reset mode.
- [x] Submit a valid test email.
- [x] Confirm a clear reset message appears.
- [x] If email service is active, confirm the reset email arrives.
- [x] Open the reset link.
    - Password reset page doesn't exist, instead takes you back to the same login page
- [ ] Try a new password shorter than 12 characters.
- [ ] Confirm it is rejected.
- [ ] Set a valid new password.
- [ ] Confirm the update succeeds.
- [ ] Confirm the old password no longer works.
- [ ] Confirm the new password works.
- [ ] Try reusing the reset link and document the result.

---

# 5. Sign-Out and Session Behavior

- [ ] Sign in.
- [ ] Create or edit test planner data.
- [ ] Wait for the site to report that it has saved.
- [ ] Sign out.
- [ ] Confirm account information is no longer displayed.
- [ ] Confirm the user returns to Sign In.
- [ ] Use the browser Back button.
- [ ] Confirm signed-in planner information is not accessible without authentication.
- [ ] Try reopening the protected planner URL while signed out.
- [ ] Confirm authentication is required.
- [ ] Test sign-out while another Smart Planner tab is open.
- [ ] Confirm the second tab responds appropriately.
- [ ] Confirm no session/token value appears in the URL.

---

# 6. Signed-In Cloud Saving

## Events

- [ ] Sign in to Test Account A.
- [ ] Create an event with an obvious fictional title.
- [ ] Confirm the interface displays a saving state.
- [ ] Confirm it eventually reports that the change was saved.
- [ ] Refresh the page.
- [ ] Confirm the event remains.
- [ ] Sign out and sign back in.
- [ ] Confirm the event remains.
- [ ] Edit the event.
- [ ] Refresh and confirm the edit remains.
- [ ] Delete the event.
- [ ] Refresh and confirm the deletion remains.

## Tasks

- [ ] Create a task.
- [ ] Refresh and confirm the task remains.
- [ ] Mark the task complete.
- [ ] Refresh and confirm the completed state remains.
- [ ] Mark it incomplete again.
- [ ] Confirm the updated state saves.
- [ ] Edit the task.
- [ ] Confirm the edit persists.
- [ ] Delete the task.
- [ ] Confirm deletion persists.

## Supabase Verification

- [ ] If authorized, check the Supabase dashboard for Test Account A.
- [ ] Confirm expected planner information was uploaded.
- [ ] Confirm the information belongs to the correct test user.
- [ ] Confirm readable account passwords are not stored in planner/profile tables.
- [ ] Confirm only expected planner/profile information is stored.

---

# 7. Save Errors and Recovery

- [ ] Sign in.
- [ ] Disconnect the laptop from the internet.
- [ ] Make a planner change.
- [ ] Confirm the website tells the user that the change was not saved.
- [ ] Confirm **Retry save** becomes available when appropriate.
- [ ] Reconnect to the internet.
- [ ] Retry the save.
- [ ] Confirm it succeeds.
- [ ] Test the Reload Cloud Copy option when unsaved changes exist.
- [ ] Confirm the warning clearly explains that unsaved changes may be lost.
- [ ] Try closing/reloading while a save is pending.
- [ ] Confirm the user receives an appropriate warning.

---

# 8. Test Account Separation

Create two separate fictional accounts.

## Test Account A

- [ ] Create an event titled `User A Private Event`.
- [ ] Create a task titled `User A Private Task`.
- [ ] Sign out.

## Test Account B

- [ ] Sign in as Test Account B.
- [ ] Confirm User A's event does not appear.
- [ ] Confirm User A's task does not appear.
- [ ] Confirm User B sees only User B's planner information.
- [ ] Create User B information.
- [ ] Sign out.
- [ ] Sign back in as User A.
- [ ] Confirm User B information does not appear.

## Supabase / Authorization Review

- [ ] Verify Row Level Security is enabled on exposed user-data tables.
- [ ] Review policies for reading data.
- [ ] Review policies for creating data.
- [ ] Review policies for updating data.
- [ ] Review policies for deleting data.
- [ ] Confirm anonymous visitors cannot access signed-in planner records.
- [ ] Confirm account ownership is based on the authenticated user and not an editable browser-supplied account identifier.

---

# 9. Guest / Local Demo

- [ ] Open the Planner using guest mode.
- [ ] Confirm no sign-in is required.
- [ ] Create an event.
- [ ] Create a task.
- [ ] Confirm the site identifies the session as local/guest mode.
- [ ] Refresh while device saving is disabled.
- [ ] Confirm behavior matches the website's explanation of unsaved local data.
- [ ] Enable **Save my planner on this device**.
- [ ] Create test data.
- [ ] Refresh.
- [ ] Confirm saved local information remains.
- [ ] Disable device saving.
- [ ] Confirm the interface explains what happens to existing in-tab data.
- [ ] Confirm guest information is not automatically uploaded to Supabase.

---

# 10. Local-to-Account Migration

- [ ] Create fictional planner information in guest/local mode.
- [ ] Enable local saving if needed.
- [ ] Sign in to a test account.
- [ ] Confirm Smart Planner identifies existing local plans.
- [ ] Confirm it asks before importing them into the account.
- [ ] Cancel the migration.
- [ ] Confirm nothing uploads.
- [ ] Repeat and accept the migration.
- [ ] Confirm local events appear in the signed-in account.
- [ ] Confirm local tasks appear in the signed-in account.
- [ ] Refresh and confirm migrated information remains.
- [ ] Confirm the local copy is removed only after successful cloud saving.

---

# 11. Event Creation and Editing

- [ ] Add a new event.
- [ ] Enter a title.
- [ ] Select a date.
- [ ] Select a category.
- [ ] Enter a start time.
- [ ] Enter an end time.
- [ ] Enter an optional location.
- [ ] Save the event.
- [ ] Confirm it appears in Today or Calendar where appropriate.
- [ ] Edit the event.
- [ ] Confirm all previously saved information loads into the editor.
- [ ] Change the title.
- [ ] Change the date.
- [ ] Change the category.
- [ ] Change the start/end time.
- [ ] Change the location.
- [ ] Save and confirm the updates appear.
- [ ] Delete the event.
- [ ] Confirm the event disappears.

## Event Validation

- [ ] Try saving with a blank title.
- [ ] Try a title at the maximum supported length.
- [ ] Attempt a title beyond the allowed length.
- [ ] Try a location at the maximum supported length.
- [ ] Attempt a location beyond the allowed length.
- [ ] Set the end time equal to the start time.
- [ ] Set the end time before the start time.
- [ ] Confirm invalid times are rejected.
- [ ] Create overlapping events.
- [ ] Confirm the site warns about the overlap.
- [ ] Create an event in each category: Class, Focus, Work, Personal.
- [ ] Confirm category labels appear in addition to color.
- [ ] Enter HTML-looking text such as `<b>Test</b>` in a title.
- [ ] Confirm it is displayed as text rather than executed as HTML.

---

# 12. Task Functions

- [ ] Add a task.
- [ ] Enter a title.
- [ ] Select a date.
- [ ] Select a category.
- [ ] Save the task.
- [ ] Confirm the task appears.
- [ ] Edit the task.
- [ ] Confirm changes save correctly.
- [ ] Mark the task complete.
- [ ] Confirm the completed style/state appears.
- [ ] Mark it incomplete.
- [ ] Confirm it returns to the to-do state.
- [ ] Search for a task.
- [ ] Confirm search results are correct.
- [ ] Filter All Tasks.
- [ ] Filter To Do tasks.
- [ ] Filter Completed tasks.
- [ ] Create an overdue unfinished task.
- [ ] Confirm it is identified as overdue.
- [ ] Delete a task.
- [ ] Confirm deletion works.
- [ ] Attempt a blank task title.
- [ ] Attempt a title longer than the supported maximum.
- [ ] Enter HTML-looking text and confirm it is displayed safely as text.

---

# 13. Today Dashboard

- [ ] Open Today.
- [ ] Confirm today's date is correct.
- [ ] Confirm the greeting is appropriate.
- [ ] Confirm today's events appear.
- [ ] Confirm unfinished tasks appear.
- [ ] Confirm the number of events displayed in the statistics is accurate.
- [ ] Confirm scheduled-time totals appear reasonable.
- [ ] Confirm the unfinished-task count is accurate.
- [ ] Confirm empty-state instructions appear when no data exists.
- [ ] Dismiss the welcome message.
- [ ] Confirm it behaves as expected afterward.

---

# 14. Weekly Calendar

- [ ] Open Calendar.
- [ ] Confirm seven days are displayed for the selected week.
- [ ] Confirm today's date is visually identified.
- [ ] Confirm events show on the correct day.
- [ ] Confirm event start/end times appear correctly.
- [ ] Confirm categories display correctly.
- [ ] Select an event from the calendar and confirm it opens for editing.
- [ ] Add an event directly from a specific day.
- [ ] Confirm the correct date is preselected.
- [ ] Select Previous Week.
- [ ] Confirm the displayed week changes.
- [ ] Select Next Week.
- [ ] Confirm the displayed week changes.
- [ ] Select This Week.
- [ ] Confirm it returns to the current week.
- [ ] Confirm the displayed week label is accurate.

---

# 15. Calendar `.ics` Export

- [ ] Create several fictional events.
- [ ] Include an event with a location.
- [ ] Include punctuation/special characters in a title.
- [ ] Select **Export calendar (.ics)**.
- [ ] Confirm an `.ics` file downloads.
- [ ] Confirm tasks are not included in the calendar export.
- [ ] Open the file in a text editor.
- [ ] Confirm it contains calendar/event information.
- [ ] Confirm no password, session token, email address, or API key was included unexpectedly.
- [ ] Import the exported file into Google Calendar.
- [ ] Confirm titles transfer correctly.
- [ ] Confirm dates transfer correctly.
- [ ] Confirm times transfer correctly.
- [ ] Confirm locations transfer correctly.
- [ ] If available, repeat with Apple Calendar.
- [ ] Test commas in event titles/locations.
- [ ] Test semicolons.
- [ ] Test backslashes.
- [ ] Test special characters.
- [ ] Confirm the exported calendar remains valid.

---

# 16. Calendar `.ics` Import

## Valid Import

- [ ] Import the provided sample-week `.ics` file.
- [ ] Confirm events are added.
- [ ] Import the Google Calendar test `.ics` file.
- [ ] Confirm event titles import correctly.
- [ ] Confirm event dates import correctly.
- [ ] Confirm event times import correctly.
- [ ] Confirm event locations import correctly.
- [ ] If available, import the Apple Calendar test file.
- [ ] Confirm imported events persist after refresh when signed in.
- [ ] Confirm guest imports remain local.

## Duplicate Behavior

- [ ] Import the same `.ics` file twice.
- [ ] Confirm duplicate events are skipped rather than duplicated.
- [ ] Confirm the user receives a clear result message.

## Invalid Files

- [ ] Import an empty `.ics` file.
- [ ] Import malformed calendar text.
- [ ] Rename a non-calendar file to `.ics` and attempt import.
- [ ] Attempt to import a file larger than the configured maximum.
- [ ] Confirm oversized files are rejected.
- [ ] Import an event missing its title.
- [ ] Import an event missing its start time.
- [ ] Import an event missing its end time.
- [ ] Import an event with an invalid time relationship.
- [ ] Confirm invalid events are skipped/rejected safely.
- [ ] Confirm no internal error/stack trace is shown.

## Compatibility Cases

- [ ] Test an all-day calendar event and document the result.
- [ ] Test a recurring calendar event and document the result.
- [ ] Test a UTC event and document the result.
- [ ] Test an event with explicit timezone information and document the result.
- [ ] Test an overnight event and document the result.

---

# 17. Settings: Appearance

- [ ] Open Settings.
- [ ] Select System theme.
- [ ] Confirm the appearance follows the system preference.
- [ ] Select Light theme.
- [ ] Confirm Light theme applies.
- [ ] Refresh and confirm the theme choice remains on the device.
- [ ] Select Dark theme.
- [ ] Confirm Dark theme applies.
- [ ] Refresh and confirm it remains.
- [ ] Use the top theme button to cycle themes.
- [ ] Confirm the accessible name/title changes appropriately.
- [ ] Confirm theme changes do not affect planner data.

---

# 18. Accessible Solid Mode

- [ ] Enable Accessible Solid Mode.
- [ ] Confirm backgrounds become more solid.
- [ ] Confirm borders become stronger where expected.
- [ ] Confirm links are easier to distinguish.
- [ ] Confirm decorative shadows/tilts are removed.
- [ ] Navigate around the site with Solid Mode on.
- [ ] Refresh and confirm the preference remains when storage is available.
- [ ] Disable Solid Mode.
- [ ] Confirm the normal appearance returns.

---

# 19. Time and Timezone Settings

- [ ] Confirm the site clock displays.
- [ ] Confirm the current date is correct.
- [ ] Change Display Timezone.
- [ ] Confirm the displayed clock changes appropriately.
- [ ] Refresh and confirm the selected display timezone remains on the device.
- [ ] Return to Device Time.
- [ ] Confirm planner event times remain device-local as described by the website.
- [ ] Export a calendar after changing the display timezone.
- [ ] Confirm the user-facing timezone explanation remains accurate.

---

# 20. Notifications and Reminders

- [ ] Open notification settings.
- [ ] Confirm current browser permission status is displayed.
- [ ] Select **Enable notifications**.
- [ ] Allow permission.
- [ ] Confirm the site reports that notifications are enabled.
- [ ] Send a test notification.
- [ ] Confirm it appears.
- [ ] Enable event reminders.
- [ ] Create an event beginning soon enough to test the reminder behavior.
- [ ] Confirm the reminder appears while the Planner is open.
- [ ] Confirm the same event is not repeatedly notified in the same session.
- [ ] Disable event reminders.
- [ ] Confirm reminders stop.
- [ ] Deny notification permission and confirm the website provides understandable instructions.
- [ ] Document differences between Chrome, Edge, and Safari if tested.

---

# 21. AI Assistant Website Function

Use only a dedicated test API key if this feature is tested. Never put the key in GitHub evidence.

## Settings

- [ ] Confirm the default AI setting is **No AI assistant**.
- [ ] Confirm no AI request happens automatically.
- [ ] Select OpenAI.
- [ ] Attempt to save without a key.
- [ ] Confirm an understandable message appears.
- [ ] Select Anthropic.
- [ ] Attempt to save without a key.
- [ ] Confirm an understandable message appears.
- [ ] Enter an invalid test key.
- [ ] Test the connection.
- [ ] Confirm failure is handled safely.
- [ ] If authorized, enter a valid test key.
- [ ] Test the connection.
- [ ] Confirm the result is displayed.
- [ ] Confirm the full API key is not displayed after saving.
- [ ] Confirm only limited identifying information about the saved key appears.
- [ ] Clear the API key.
- [ ] Confirm it is removed.

## Tab-Only vs Browser Storage

- [ ] Leave **Keep this key in this browser** unchecked.
- [ ] Close the tab.
- [ ] Reopen and confirm the tab-only key is no longer available.
- [ ] Test the Keep option with a dedicated test key.
- [ ] Confirm the website's warning is clear.
- [ ] Clear the key when testing is complete.

## Ask AI About My Week

- [ ] Create fictional events and unfinished tasks.
- [ ] Select **Ask AI about my week**.
- [ ] Confirm the AI response appears.
- [ ] Confirm the response relates to the actual test schedule.
- [ ] Confirm it does not invent an event that was not supplied.
- [ ] Confirm the website warns the user to verify deadlines/results.
- [ ] Test with no events/tasks.
- [ ] Turn off the network and test the AI request.
- [ ] Confirm network/provider errors are understandable.
- [ ] Confirm an error does not display the API key.

---

# 22. Privacy and Data Controls

- [ ] Open the Privacy page.
- [ ] Confirm Local Demo behavior matches actual testing.
- [ ] Confirm Signed-In Account behavior matches actual testing.
- [ ] Confirm the session explanation matches actual testing.
- [ ] Confirm calendar-import behavior matches actual testing.
- [ ] Confirm calendar-export behavior matches actual testing.
- [ ] Confirm local-to-account migration behavior matches actual testing.
- [ ] Confirm AI behavior matches actual testing.
- [ ] Confirm notification behavior matches actual testing.
- [ ] Confirm deletion behavior matches actual testing.
- [ ] Confirm provider status is current.
- [ ] Confirm external privacy-policy links work.
- [ ] Confirm the Privacy page does not claim features that are not implemented.
- [ ] Update privacy documentation whenever website data handling changes.

---

# 23. Delete Planner Data

## Guest

- [ ] Create local events/tasks.
- [ ] Choose Delete Planner Data.
- [ ] Confirm a warning appears.
- [ ] Cancel.
- [ ] Confirm data remains.
- [ ] Open the dialog again and confirm deletion.
- [ ] Confirm local planner information is removed as described.

## Signed In

- [ ] Sign in and create fictional events/tasks.
- [ ] Export a backup if desired.
- [ ] Choose Delete Planner Data.
- [ ] Confirm the warning clearly explains what will be removed.
- [ ] Cancel and confirm data remains.
- [ ] Confirm deletion.
- [ ] Refresh.
- [ ] Confirm events/tasks are gone.
- [ ] Confirm the account itself still exists.

---

# 24. Delete Account

- [ ] Sign in using a disposable fictional test account.
- [ ] Create fictional planner data.
- [ ] Open Delete Account.
- [ ] Confirm the message explains that deletion is permanent.
- [ ] Cancel.
- [ ] Confirm the account and data remain.
- [ ] Repeat and confirm account deletion.
- [ ] Confirm the user is returned to the login page.
- [ ] Attempt to sign in again.
- [ ] Confirm the deleted account no longer provides access.
- [ ] If authorized, verify the expected account/profile/planner data is removed from Supabase.

---

# 25. Accessibility: Keyboard

Complete this section without using the mouse.

- [ ] Use Tab to navigate the landing page.
- [ ] Use Tab to navigate Home.
- [ ] Use Tab to navigate Sign In.
- [ ] Use Tab to navigate the Planner.
- [ ] Confirm every interactive element can be reached.
- [ ] Confirm focus order is logical.
- [ ] Confirm focus is clearly visible.
- [ ] Use the Skip to Content link.
- [ ] Confirm it moves focus to the main content.
- [ ] Open the navigation menu with the keyboard.
- [ ] Navigate menu links.
- [ ] Close the menu with Escape.
- [ ] Create an event using only the keyboard.
- [ ] Edit an event using only the keyboard.
- [ ] Create a task using only the keyboard.
- [ ] Complete a task using only the keyboard.
- [ ] Open and close dialogs using only the keyboard.
- [ ] Confirm there are no keyboard traps.
- [ ] Confirm focus returns to a sensible location after closing dialogs.

---

# 26. Accessibility: Zoom, Reflow, Color, and Motion

- [ ] Test at 200% browser zoom.
- [ ] Test at 400% browser zoom.
- [ ] Confirm important content does not overlap.
- [ ] Confirm text is not cut off.
- [ ] Confirm controls remain usable.
- [ ] Test a narrow/mobile-size browser window.
- [ ] Confirm content reflows rather than becoming unusable.
- [ ] Confirm important information is not provided only through color.
- [ ] Verify category names accompany category colors.
- [ ] Check text/background contrast.
- [ ] Check form-control contrast.
- [ ] Check focus-indicator visibility.
- [ ] Enable reduced-motion at the operating-system/browser level.
- [ ] Confirm decorative animations stop/reduce appropriately.
- [ ] Confirm functionality does not require animation or hover.
- [ ] Enable high-contrast/forced-color mode if available.
- [ ] Confirm controls and text remain understandable.

---

# 27. Accessibility: Screen Reader

If available, use NVDA on Windows for an initial test.

- [ ] Confirm page titles are announced correctly.
- [ ] Confirm headings are announced in a meaningful hierarchy.
- [ ] Confirm navigation landmarks are recognizable.
- [ ] Confirm form fields have meaningful labels.
- [ ] Confirm required fields are understandable.
- [ ] Confirm validation errors are announced.
- [ ] Confirm save/status messages are announced.
- [ ] Confirm dialog titles are announced.
- [ ] Confirm close buttons have useful names.
- [ ] Confirm Edit Event buttons identify the event.
- [ ] Confirm Edit Task buttons identify the task.
- [ ] Confirm decorative icons are ignored where appropriate.
- [ ] Confirm the calendar is understandable without relying completely on its visual layout.

---

# 28. Website Usability

Ask someone unfamiliar with the project to complete these tasks without initially explaining how.

- [ ] Find the Home page.
- [ ] Find the guest/local demo.
- [ ] Create an account.
- [ ] Sign in.
- [ ] Add an event.
- [ ] Add a task.
- [ ] Find the weekly calendar.
- [ ] Edit an event.
- [ ] Complete a task.
- [ ] Find where calendar import/export lives.
- [ ] Export their calendar.
- [ ] Find privacy information.
- [ ] Find accessibility settings.
- [ ] Change the theme.
- [ ] Find account deletion.
- [ ] Explain the difference between Local Demo and Signed-In mode.
- [ ] Explain whether AI is automatic or optional.
- [ ] Record anything they cannot find without help.
- [ ] Record labels they find confusing.
- [ ] Record any page where they are unsure what to do next.

---

# 29. Responsive / Browser Testing

## Chrome on Windows

- [ ] Landing page
- [ ] Home
- [ ] Account creation
- [ ] Sign in
- [ ] Planner Today
- [ ] Calendar
- [ ] Tasks
- [ ] Settings
- [ ] `.ics` import
- [ ] `.ics` export
- [ ] Theme switching
- [ ] Solid Mode
- [ ] Notifications
- [ ] Privacy / Accessibility pages

## Edge on Windows

- [ ] Repeat major account and planner functions.
- [ ] Confirm layout matches expected design.
- [ ] Confirm import/export works.
- [ ] Confirm keyboard navigation works.

## Mobile-Size Layout

Using browser developer tools or an actual mobile device:

- [ ] Confirm no important horizontal overflow.
- [ ] Confirm buttons fit onscreen.
- [ ] Confirm dialogs fit onscreen.
- [ ] Confirm planner navigation remains usable.
- [ ] Confirm Calendar remains understandable.
- [ ] Confirm forms remain usable.
- [ ] Confirm footer/navigation links remain accessible.

## Apple / Safari, if available

- [ ] Home and Features
- [ ] Sign In
- [ ] Planner
- [ ] Calendar
- [ ] Notifications
- [ ] `.ics` import/export
- [ ] Keyboard navigation
- [ ] VoiceOver spot check

---

# 30. Final Website Regression Test

Run this shorter checklist after major website changes.

- [ ] Home loads.
- [ ] Features page loads.
- [ ] Create Account works.
- [ ] Sign In works.
- [ ] Sign Out works.
- [ ] Password Reset works or clearly identifies current setup limitations.
- [ ] Guest mode works.
- [ ] Create Event works.
- [ ] Edit Event works.
- [ ] Delete Event works.
- [ ] Create Task works.
- [ ] Complete Task works.
- [ ] Delete Task works.
- [ ] Signed-in data saves.
- [ ] Saved data returns after refresh.
- [ ] Test User A cannot see Test User B data.
- [ ] `.ics` Export works.
- [ ] `.ics` Import works.
- [ ] Theme switching works.
- [ ] Solid Mode works.
- [ ] Privacy links work.
- [ ] Accessibility links work.
- [ ] Keyboard navigation works.
- [ ] 200% zoom remains usable.
- [ ] Mobile layout remains usable.
- [ ] Delete Planner Data works.
- [ ] Delete Account works with a disposable test account.
- [ ] AI remains optional.
- [ ] No passwords, private keys, or session tokens are visibly exposed.

---