import sqlite3
import datetime
import icalendar
import pyodbc

#filepaths
ics_file_path = ""
db_filepath = "SmartPlanner.db"

#setup connection to database
conn = ( r"DRIVER={ODBC Driver 17 for SQL Server};"
    r"SERVER=your_server_name;"
    r"DATABASE=your_database_name;"
    r"Trusted_Connection=yes;"
    )
connection = pyodbc.connect(conn)
cursor = connection.cursor()

#read ics file
with open(ics_file_path, 'r', encode='utf-8') as file:
    cal = icalendar.from_ical(file.read())



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