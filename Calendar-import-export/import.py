import sqlite3
import datetime
import icalendar

#filepaths
ics_filepath = ""
db_filepath = "SmartPlanner.db"

#setup connection to database
conn = sqlite3.connect(db_filepath)
cursor = conn.cursor()

#read ics file
with open(ics_file_path, 'r', encode='utf-8') as file:
    cal = icalendar.from_ical(f.read())

#loop through events from ics
for component in cal.walk():
    if component.name == 'VENVENT':
        #format ics file to vars

        #Basic information
        EventTitle = str(component.get('summary', ''))
        EventLocation = str(component.get('location', ''))
        EventDescription = str(component.get('description', ''))
        EventUUID = 

        #Date time TO DO
        EventStartTime = (component.get('dtstart').dt)
        EventEndTime = (component.get('dtend').dt)

        #Reccurring TO DO

        #Alarm
        for subcomponent in component.walk():
                if subcomponent.name == "VALARM":
                    action = str(subcomponent.get('action', 'DISPLAY'))
                    trigger = str(subcomponent.get('trigger', ''))

        #Insert Event

#