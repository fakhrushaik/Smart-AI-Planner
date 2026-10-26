-- Date: 10/2/26

-- Create Database
-- Create Tables
-- Create Fields
-- Create PK and FK

-- Accounts
CREATE TABLE Accounts (
AccountID SERIAL,
AccountFirstName varchar(25),
AccountLastName varchar(25),
AccountEmail varchar(25),
AccountPhone varchar(15),
AccountPKey varchar(75),
PRIMARY KEY(AccountID)
)

-- Events
CREATE TABLE Events (
EventID SERIAL,
EventUUID UUUID DEFAULT gen_random_uuid(),
AccountID int,
EventTitle varchar(25),
EventDescription varchar(250),
EventStartDate date,
EventEndDate date,
EventAllDay SMALLINT,
EventStartTime time,
EventEndTime time,
EventNotes varchar(100),
EventLocation varchar(100),
EventRepeat varchar(25),
EventTravelTime varchar(25),
EventURL varchar(75),
EventAlert varchar(25),
PRIMARY KEY(EventID),
CONSTRAINT uq_event_uuid UNIQUE (EventUUID),
FOREIGN KEY(AccountID) REFERENCES Accounts(AccountID)
)