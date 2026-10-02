# Sensitive Security Requirements
Fields that reqire encryption
| Table | Field | Reason |
| --- | --- | --- |
| Account | AccountEmail | PII (contact information) |
| Account | AccountPhone | PII (contact information) |
| Account | AccountFirstName | PII |
| Account | AccountLastName | PII |
| Event | EventLocation | Sensitive personal schedule data |
| Event | EventNotes | May contain private personal information |
| Event | EventURL | May reveal private resources |

Fields that require hashing
| Table | Field | Requirement |
| --- | --- | --- |
| Account | AccountPKey | Must be replaced with ``PasswordHash`` and hashed using bcrypt or Argon2|

plain text passwords are prohibited

# SQL Server Security Controls
- Enable TDE at the database level to protect data files and backups
- Require encrypted connections between backend and SQL Server

# Authentication and Access Control
- Implement role based access controls (RBAC)
- Implement row level security (RLS) to prevent users from accessing other users' events

# FERPA Compliance
- Only the student may access their academic data
- No academic data may be shared with external APIs without explicit consent