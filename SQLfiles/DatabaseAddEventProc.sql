-- Date: 10/2/26

-- Add Event

-- Assume that all var handling will be done prior to execution
CREATE PROC newEvent
@AccountID as int,
@EventTitle as varchar(25),
@EventStartDate as date,
@EventEndDate as date,
@EventAllDay as tinyint,
@EventStartTime as time,
@EventEndTime as time,
@EventNotes as varchar(100),
@EventLocation as varchar(100),
@EventRepeat as varchar(25),
@EventTravelTime as varchar(25),
@EventURL as varchar(75),
@EventAlert as varchar(25)

AS

BEGIN TRAN

INSERT INTO Events (AccountID, EventTitle, EventDescription, EventStartDate, EventEndDate, EventAllDay,
EventStartTime, EventEndTime, EventNotes, EventLocation, EventRepeat, EventTravelTime,
EventURL, EventAlert)
VALUES (@AccountID, @EventTitle, @EventDescription, @EventStartDate, @EventEndDate, @EventAllDay,
@EventStartTime, @EventEndTime, @EventNotes, @EventLocation, @EventRepeat, @EventTravelTime,
@EventURL, @EventAlert)

COMMIT TRAN