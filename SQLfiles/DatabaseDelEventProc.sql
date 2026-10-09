-- Date: 10/5/26

-- Delete Event

-- Requires only the event ID
CREATE PROC delEvent
@EventID as int

AS

BEGIN TRAN

DELETE FROM Events
WHERE EventID=@EventID

COMMIT TRAN