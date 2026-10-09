-- Date: 10/5/26
-- notes for vars needed for Procedures and what they do

EXEC newEvent
-- new event creates an event, the assumption is that the variables will be checked prior to being executed and that all vars will be provided
    -- @AccountID as int,
    -- @EventTitle as varchar(25),
    -- @EventDescription as varchar(250),
    -- @EventStartDate as date,
    -- @EventEndDate as date,
    -- @EventAllDay as tinyint,
    -- @EventStartTime as time,
    -- @EventEndTime as time,
    -- @EventNotes as varchar(100),
    -- @EventLocation as varchar(100),
    -- @EventRepeat as varchar(25),
    -- @EventTravelTime as varchar(25),
    -- @EventURL as varchar(75),
    -- @EventAlert as varchar(25)

EXEC delEvent
-- delete event deletes an event based off of the provided EventID, the assumption that verification of deletion will be happening prior to deletion
    -- @EventID as int

EXEC updateEvent
-- update event updates an event completely (this is to simplify the code) based off of the provided EventID, the assumption is that the variables will be checked prior to being executed and that all vars will be provided
    -- @EventID as int,
    -- @AccountID as int,
    -- @EventTitle as varchar(25),
    -- @EventDescription as varchar(250),
    -- @EventStartDate as date,
    -- @EventEndDate as date,
    -- @EventAllDay as tinyint,
    -- @EventStartTime as time,
    -- @EventEndTime as time,
    -- @EventNotes as varchar(100),
    -- @EventLocation as varchar(100),
    -- @EventRepeat as varchar(25),
    -- @EventTravelTime as varchar(25),
    -- @EventURL as varchar(75),
    -- @EventAlert as varchar(25)
