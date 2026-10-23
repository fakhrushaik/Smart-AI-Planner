import datetime
import icalendar
import pyodbc

#filepaths
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
    INSERT INTO Events (EventUUID, EventTitle, EventDescription, EventLocation, EventStartTime, EventEndTime)
    VALUES (?, ?, ?, ?, ?, ?)
"""

try:
    #connect to database
    connection = pyodbc.connect(conn)
    cursor = connection.cursor()

    #loop through events from ics
    for component in cal.walk():
        if component.name == 'VENVENT':
            #format ics file to vars

            #Basic information
            EventUUID = str(component.get('uid'))
            EventTitle = str(component.get('summary', ''))
            EventDescription = str(component.get('description', ''))
            EventLocation = str(component.get('location', ''))
            

            #Date time TO DO
            start_dt = (component.get('dtstart').dt)
            end_dt = (component.get('dtend').dt)
            EventStartTime = start_dt.dt if start_dt else None
            EventEndTime = end_dt.dt if end_dt else None

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
                        (EventUUID, EventTitle, EventDescription, EventLocation, EventStartTime, EventEndTime),
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