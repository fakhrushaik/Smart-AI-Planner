# Smart Planner Calendar Import/Export Security Review

## Files Reviewed

- `Calendar-import-export/import.py`
- `Calendar-import-export/export.py`
- `Calendar-import-export/to-do.md`

---

# 1. import.py

1. The file is opened using `encode='utf-8'`. Python's `open()` uses the `encoding` argument.
    - Use encoding='utf-8'
2. The component check currently uses `VENVENT`; the expected iCalendar event component is `VEVENT`.
3. `component.get('dtstart').dt` and `component.get('dtend').dt` already obtain decoded date/time values, but the current code subsequently attempts another `.dt` access.
    - Read .dt only once from each iCalendar date property.
4. database encryption with Encrypt=yes;TrustServerCertificate=no;

# 2. export.py

1. Query returns 13 columns, but code unpacks 14 variables. Align the selected columns and variables.
2. The script imports the `datetime` module but uses `datetime.now(datetime.UTC)`. The timestamp generation should be corrected and formatted as a valid iCalendar timestamp.
3. The current exporter uses SQLite while the import script uses `pyodbc`. The project's existing to-do notes already identify migration from SQLite to `pyodbc` as unfinished work.
4. `AccountID` is currently initialized as an empty string. This should eventually be obtained from the authenticated user context.
5. Exported event data is inserted directly into the iCalendar text without iCalendar escaping. Build events with the icalendar library.

# 3. iCalendar Escaping


Values such as event titles, descriptions, and locations are currently placed directly into the Python-generated `.ics` output.

The browser implementation in `planner.js` already escapes backslashes, line breaks, semicolons, and commas when generating calendar files. The Python exporter should apply equivalent protection.

## Recommendation

Before adding database values to iCalendar properties, escape at minimum:

- Backslashes (`\\`)
- New lines
- Semicolons (`;`)
- Commas (`,`)

Apply escaping to user-controlled or stored text such as:

- `SUMMARY`
- `DESCRIPTION`
- `LOCATION`
- Reminder descriptions

This helps prevent user-controlled event content from changing the intended structure of the exported iCalendar file.

---

# 4. Calendar Import Validation

An uploaded or selected `.ics` file should be treated as untrusted input.


### File-size limit

Reject files above a defined maximum size before parsing them. The exact production limit should be selected by the development team based on expected use.

### Event-count limit

Set a maximum number of events that can be processed in a single import. This prevents unexpectedly large calendar files from creating excessive processing or database activity.

### Field-length limits

Validate lengths before database insertion for fields including:

- Event UUID
- Title
- Description
- Location

Limits should align with the application's database schema.

### Required-field validation

At minimum, validate fields required by the application's event model, including the event identifier and required date/time properties.

### Date/time validation

Reject events containing invalid or unusable date/time values. Where applicable, verify that the end value is logically valid relative to the start value.

### Malformed-file handling

Parsing failures should be caught and reported using a safe user-facing message. Raw parser, database, server, or stack-trace details should not be exposed to users.

---

# 5. AccountID and Authorization


Imported events should be associated with the authenticated user's account.

The application should not trust an `AccountID` supplied by:

- The `.ics` file
- A URL/query parameter
- A hidden form field
- JavaScript in the browser
- Other client-controlled request data

Instead, the backend should obtain the account identifier from authenticated server-side state after the user's identity has been validated.

### Security requirement

> Every calendar import and export operation must be scoped to the authenticated account. The server must establish the account identity and must not rely on a client-provided AccountID for authorization.

### Suggested authorization tests

- User A cannot export User B's events.
- User A cannot modify an identifier to import events into User B's account.
- Imported events are automatically associated with the currently authenticated account.
- An unauthenticated request cannot perform an authenticated calendar import/export operation once accounts are enabled.

---

# 6. Transaction Handling

Calendar imports should be treated as a database transaction:

1. Parse and validate the file.
2. Begin/process the database operation.
3. Insert validated events.
4. Commit when the complete import succeeds.
5. Roll back if an error causes the import to fail.

The objective is to avoid leaving a calendar partially imported after a failure.

Database connections should also be closed reliably when processing completes or fails.
