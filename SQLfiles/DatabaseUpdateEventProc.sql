-- Date: 10/2/26

-- Update Event

-- Assume that all var handling will be done prior to execution
-- Vars will be default null unless set, allowing for only updating new info
CREATE PROC newEvent
@AccountID as int = NULL,
@EventTitle as varchar(25) = NULL,
@EventStartDate as date = NULL,
@EventEndDate as date = NULL,
@EventAllDay as tinyint = NULL,
@EventStartTime as time = NULL,
@EventEndTime as time = NULL,
@EventNotes as varchar(100) = NULL,
@EventLocation as varchar(100) = NULL,
@EventRepeat as varchar(25) = NULL,
@EventTravelTime as varchar(25) = NULL,
@EventURL as varchar(75) = NULL,
@EventAlert as varchar(25) = NULL

AS

BEGIN TRAN

INSERT INTO Events (AccountID, EventTitle, EventStartDate, EventEndDate, EventAllDay,
EventStartTime, EventEndTime, EventNotes, EventLocation, EventRepeat, EventTravelTime,
EventURL, EventAlert)
VALUES (@AccountID, @EventTitle, @EventStartDate, @EventEndDate, @EventAllDay,
@EventStartTime, @EventEndTime, @EventNotes, @EventLocation, @EventRepeat, @EventTravelTime,
@EventURL, @EventAlert)

COMMIT TRAN