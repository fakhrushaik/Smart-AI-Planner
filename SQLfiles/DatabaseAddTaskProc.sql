-- Date: 10/26/26

-- Add Tasks

-- Assume that all var handling will be done prior to execution
CREATE OR REPLACE PROCEDURE newTask (
p_AccountID int,
p_TaskTitle varchar(25),
p_TaskDate date,
p_TaskCategory varchar(25),
p_TaskComplete boolean
)
LANGUAGE plpgsql
AS $$

BEGIN

INSERT INTO Tasks (AccountID, TaskTitle, TaskDate, TaskCategory, TaskComplete)
VALUES (p_AccountID, p_TaskTitle, p_TaskDate, p_TaskCategory, p_TaskComplete);

END;
$$;