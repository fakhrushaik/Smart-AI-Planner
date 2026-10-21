import sqlite3
import datetime

#Initialize
conn = sqlite3.connect("SmartPlanner.db")
cursor = conn.cursor()

#Handle AcccountID
AccountID = ""

#Grab rows
cursor.execute("SELECT EventUUID, EventTitle, EventStartDate, " \
"EventEndDate, EventAllDay, EventStartTime, EventEndTime, EventNotes, EventLocation, " \
"EventRepeat, EventTravelTime, EventURL, " \
"EventAlert FROM Events WHERE AccountID = ?", (AccountID,))
rows = cursor.fetchall()

#Init events list to store events from loop
ics_eventslist = []

#Loop through each event row and format the event to be stored
for row in rows:
    EventUUID, EventTitle, EventDescription, EventStartDate, EventEndDate, EventAllDay, EventStartTime, EventEndTime, EventNotes, EventLocation, EventRepeat, EventTravelTime, EventURL, EventAlert = row

    #Formatting ics text based on template
    ics_event = f"""
    BEGIN:VEVENT
    UID:{EventUUID}6@smartplanner.com
    DTSTAMP:{datetime.now(datetime.UTC)}
    DTSTART:{EventStartTime}
    DTEND:{EventEndTime}
    SUMMARY:{EventTitle}
    DESCRIPTION:{EventDescription}
    LOCATION:{EventLocation}
    BEGIN:VALARM
    TRIGGER:{EventAlert}
    ACTION:DISPLAY
    DESCRIPTION:Reminder: {EventTitle}
    END:VALARM
    END:VEVENT"""

    #Add to list of events
    ics_eventslist.append(ics_event)

#Compile list into body as single object
ics_body = "\n".join(ics_eventslist)

#Apply header wrapper
ics_content = f"""BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//Smart Planner//EN
    CALSCALE:GREGORIAN
    {ics_body}
    END:VCALENDAR"""

with open("SmartPlannerEvent.ics", "w", encoding="utf-8") as events:
    events.write(ics_content)