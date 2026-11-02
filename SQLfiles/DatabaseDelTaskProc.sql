-- Date: 10/5/26

-- Delete Task

-- Requires only the event ID
CREATE OR REPLACE PROCEDURE delTask(p_TaskID int, p_AccountID)

LANGUAGE plpgsql 
AS $$
BEGIN

DELETE FROM Tasks
WHERE TaskID = p_TaskID AND AccountID = p_AccountID;

END;
$$;