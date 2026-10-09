import sqlite3
import datetime

conn = sqlite3.connect("SmartPlanner.db")
cursor = conn.cursor()

cursor.execute("SELECT EventID, EventTitle, EventStartDate, " \
"EventEndDate, EventAllDay, EventStartTime, EventEndTime, EventNotes, EventLocation, " \
"EventRepeat, EventTravelTime, EventURL, EventAlert FROM Events")
rows = cursor.fetchall()

for row in rows:
    EventID, EventTitle, EventStartDate, EventEndDate, EventAllDay, EventStartTime, EventEndTime, EventNotes, EventLocation, EventRepeat, EventTravelTime, EventURL, EventAlert = row

    #Formatting ics text based on template
    ics_content = f"""BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//Smart Planner//EN
    CALSCALE:GREGORIAN
    BEGIN:VEVENT
    UID:{EventID}6@smartplanner.com
    DTSTAMP:{datetime.now(datetime.UTC)}
    DTSTART:{EventStartTime}
    DTEND:{EventEndTime}
    SUMMARY:{EventTitle}
    DESCRIPTION:{}
    LOCATION:Conference Room A / Zoom
    BEGIN:VALARM
    TRIGGER:-PT30M
    ACTION:DISPLAY
    DESCRIPTION:Reminder: Team Strategy Meeting
    END:VALARM
    END:VEVENT
    END:VCALENDAR"""
    