-- Date: 10/2/26

-- Create Database
-- Create Tables
-- Create Fields
-- Create PK and FK

CREATE DATABASE SmartPlanner
GO

USE SmartPlanner
GO

-- Accounts
CREATE TABLE Accounts (
AccountID int identity(1,1),
AccountFirstName varchar(25),
AccountLastName varchar(25),
AccountEmail varchar(25),
AccountPhone varchar(15),
AccountPKey varchar(75),
PRIMARY KEY(AccountID)
)

-- Events
CREATE TABLE Events (
EventID int identity(1,1),
AccountID int,
EventTitle varchar(25),
EventDescription varchar(250),
EventStartDate date,
EventEndDate date,
EventAllDay tinyint,
EventStartTime time,
EventEndTime time,
EventNotes varchar(100),
EventLocation varchar(100),
EventRepeat varchar(25),
EventTravelTime varchar(25),
EventURL varchar(75),
EventAlert varchar(25),
PRIMARY KEY(EventID),
FOREIGN KEY(AccountID) REFERENCES Accounts(AccountID)
)