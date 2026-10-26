TO DO list for import exports
[X] export: format output for date-time
[X] export: use UUIDv4 for generating unique ids for events when putting into .ics
[X] export: make sure only AccountID of current user is being used to pull Events with the same AccountID
[] export: Get the AccountID from where it is going to be passed in from the website (need to figure out how we are going to do that)
[]  BOTH: Add Reccurring event
[X] import: start work on creation of import script
[X] BOTH: swap from sqlite3 to pyodbc

[X]SWAP SYNTAX TO POSTGRESQL FROM T-SQL FOR PROCS AND CREATE
[]Add Tasks table to SQL
    - task id pk
    - title
    - date
    - category
    - complete (opposite of to-do)
    - account id fk
