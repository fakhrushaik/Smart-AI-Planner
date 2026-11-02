-- Date: 10/5/26

-- Update Task

-- Assume that all var handling will be done prior to execution
-- Vars always be passed in as the user will be updating the event from the full event infromation
-- So no need to placeholder will NULL, also this means the entire row can be replaced always
CREATE OR REPLACE PROCEDURE updateTask(
    p_TaskID int,
    p_AccountID int,
    p_TaskTitle varchar(25),
    p_TaskDate date,
    p_TaskCategory varchar(25),
    p_TaskComplete boolean
)
LANGUAGE plpgsql
AS $$

BEGIN
UPDATE Events 
SET TaskTitle = p_TaskTitle, TaskDate = p_TaskDate, TaskCategory = p_TaskCategory, 
TaskComplete = p_TaskCategory
WHERE TaskID = p_TaskID AND AccountID = p_AccountID;

END;
$$;
