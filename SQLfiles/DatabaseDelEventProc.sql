-- Date: 10/5/26

-- Delete Event

-- Requires only the event ID
CREATE OR REPLACE PROCEDURE delEvent(p_EventID int, p_AccountID int)

LANGUAGE plpgsql 
AS $$
BEGIN

DELETE FROM Events
WHERE EventID = p_EventID AND AccountID = p_AccountID;

END;
$$;