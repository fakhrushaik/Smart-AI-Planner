import datetime
import icalendar
import pyodbc

#filepaths TO DO
ics_file_path = ""

#setup connection string to database TO DO
conn = ( r"DRIVER={ODBC Driver 17 for SQL Server};"
    r"SERVER=your_server_name;"
    r"DATABASE=your_database_name;"
    r"Trusted_Connection=yes;"
    )

#read ics file
with open(ics_file_path, 'r', encode='utf-8') as file:
    cal = icalendar.from_ical(file.read())

#Set up SQL Insert Query
insert_query = """
    INSERT INTO Events (EventUUID, EventTitle, EventDescription, EventLocation, EventStartDate, EventStartTime, EventEndDate, EventEndTime, EventAllDay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

try:
    #connect to database
    connection = pyodbc.connect(conn)
    cursor = connection.cursor()

    #loop through events from ics
    for component in cal.walk():
        if component.name == 'VEVENT':
            #format ics file to vars

            #Basic information
            EventUUID = str(component.get('uid'))
            EventTitle = str(component.get('summary', ''))
            EventDescription = str(component.get('description', ''))
            EventLocation = str(component.get('location', ''))
            

            #Date time 
            start_dt = (component.get('dtstart').dt)
            end_dt = (component.get('dtend').dt)

            if isinstance(start_dt, datetime.datetime):
                EventStartDate = start_dt.date().isoformat() #EX: 2026-10-23: Postgres handles iso format
                EventStartTime = start_dt.time().isoformat() #EX: 11:35:00 or +- offsett: Postgres handles iso format
                EventAllDay = '0'
            elif isinstance(start_dt, datetime.date):
                EventStartDate = start_dt.isoformat() #EX: 2026-10-23: Postgres handles iso format
                EventStartTime = '00:00:00'
                EventAllDay = '1'

            if isinstance(end_dt, datetime.datetime):
                EventEndDate = end_dt.date().isoformat() #EX: 2026-10-23: Postgres handles iso format
                EventEndTime = end_dt.time().isoformat() #EX: 11:35:00 or +- offsett: Postgres handles iso format
                EventAllDay = '0'
            elif isinstance(start_dt, datetime.date):
                EventEndDate = end_dt.isoformat() #EX: 2026-10-23: Postgres handles iso format
                EventEndTime = '00:00:00'
                EventAllDay = '1'
            
            #Reccurring TO DO

            #Alarm
            for subcomponent in component.walk():
                if subcomponent.name == "VALARM":
                    action = str(subcomponent.get('action', 'DISPLAY'))
                    trigger = str(subcomponent.get('trigger', ''))

            #Insert Event
            try:
                cursor.execute(
                        insert_query,
                        (EventUUID, EventTitle, EventDescription, EventLocation, EventStartDate, EventStartTime, EventEndDate, EventEndTime, EventAllDay),
                )
                print(f'Imported: {EventTitle}')
            except Exception as err:
                print(f"Failed to import event: {EventTitle}")

#catch error in db
except Exception as db_err:
    print(f'Database connection or exec failed: {db_err}')

finally:
    # Close connections always
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()