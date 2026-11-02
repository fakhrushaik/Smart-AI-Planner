-- Date: 10/2/26

-- Add Event

-- Assume that all var handling will be done prior to execution
CREATE OR REPLACE PROCEDURE newEvent (
p_AccountID int,
p_EventTitle varchar(25),
p_EventDescription varchar(250),
p_EventStartDate date,
p_EventEndDate date,
p_EventAllDay boolean,
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

INSERT INTO Events (AccountID, EventTitle, EventDescription, EventStartDate, EventEndDate, EventAllDay,
EventStartTime, EventEndTime, EventNotes, EventLocation, EventRepeat, EventTravelTime,
EventURL, EventAlert)
VALUES (p_AccountID, p_EventTitle, p_EventDescription, p_EventStartDate, p_EventEndDate, p_EventAllDay,
p_EventStartTime, p_EventEndTime, p_EventNotes, p_EventLocation, p_EventRepeat, p_EventTravelTime,
p_EventURL, p_EventAlert);

END;
$$;