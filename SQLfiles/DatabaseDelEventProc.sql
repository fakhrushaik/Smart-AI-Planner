-- Date: 10/5/26

-- Delete Event

-- Requires only the event ID
CREATE PROCEDURE delEvent(p_EventID int)

LANGUAGE plpgsql 
AS $$
BEGIN

DELETE FROM Events
WHERE EventID = p_EventID;

END $$;