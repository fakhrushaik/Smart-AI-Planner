-- Date: 10/5/26

-- Update Event

-- Assume that all var handling will be done prior to execution
-- Vars always be passed in as the user will be updating the event from the full event infromation
-- So no need to placeholder will NULL, also this means the entire row can be replaced always
CREATE OR REPLACE PROCEDURE updateEvent(
p_EventID int,
p_AccountID int,
p_EventTitle varchar(25),
p_EventDescription varchar(250),
p_EventStartDate date,
p_EventEndDate date,
p_EventAllDay smallint,
p_EventStartTime time,
p_EventEndTime time,
p_EventNotes varchar(100),
p_EventLocation varchar(100),
p_EventRepeat varchar(25),
p_EventTravelTime varchar(25),
p_EventURL varchar(75),
p_EventAlert varchar(25)
)
LANGUAGE plpgsql
AS $$

BEGIN
UPDATE Events 
SET AccountID = p_AccountID, EventTitle = p_EventTitle, EventDescription = p_EventDescription, EventStartDate = p_EventStartDate, 
EventEndDate = p_EventEndDate, EventAllDay = p_EventAllDay,
EventStartTime = p_EventStartTime, EventEndTime = p_EventEndTime, EventNotes = p_EventNotes, 
EventLocation = p_EventLocation, EventRepeat = p_EventRepeat, EventTravelTime = p_EventTravelTime,
EventURL = p_EventURL, EventAlert = p_EventAlert
WHERE EventID = p_EventID;

END;
$$;
