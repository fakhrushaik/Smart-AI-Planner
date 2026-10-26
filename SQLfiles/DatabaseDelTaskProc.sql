-- Date: 10/5/26

-- Delete Task

-- Requires only the event ID
CREATE OR REPLACE PROCEDURE delTask(p_TaskID int)

LANGUAGE plpgsql 
AS $$
BEGIN

DELETE FROM Tasks
WHERE TaskID = p_TaskID;

END;
$$;