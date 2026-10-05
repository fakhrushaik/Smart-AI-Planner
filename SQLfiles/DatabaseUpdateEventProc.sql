-- Date: 10/5/26

-- Update Event

-- Assume that all var handling will be done prior to execution
-- Vars always be passed in as the user will be updating the event from the full event infromation
-- So no need to placeholder will NULL, also this means the entire row can be replaced always
CREATE PROC updateEvent
@EventID as int,
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

UPDATE Events 
SET AccountID = @AccountID, EventTitle = @EventID, EventStartDate = @EventStartDate, 
EventEndDate = @EventEndDate, EventAllDay = @EventAllDay,
EventStartTime = @EventStartTime, EventEndTime = @EventEndTime, EventNotes = @EventNotes, 
EventLocation = @EventLocation, EventRepeat = @EventRepeat, EventTravelTime = @EventTravelTime,
EventURL = @EventURL, EventAlert = @EventAlert
WHERE EventID = @EventID

COMMIT TRAN