# Sensitive Security Requirements
Randomized encryption provides the strongest protection because it produces different ciphertext each time, even for identical values.
This prevents pattern analysis and protects user privacy.

Accounts Table
- AccountFirstName
- AccountLastName
- AccountEmail
- AccountPhone

Events Table
- EventLocation
- EventNotes
- EventURL
- EventAlert

Fields that require hashing
- Replace AccountPKey varchar(75) with PasswordHash varbinary(256) hashed using Argon2
- Backend must hash before inserting into the database
- plain text passwords are prohibited

# SQL Server Security Controls
- Enable TDE at the database level to protect data files and backups
- Require encrypted connections between backend and SQL Server
- Use an encrypted connection, and verify that the SQL Server's certificate is valid
    - Encrypt=True;TrustServerCertificate=False;


# Authentication and Access Control
- Implement role based access controls (RBAC)
    - Recommended Roles:
        - app_user: access only their own data
        - app_admin: system-level access, no user data
        - db_owner: DevOps only
- Implement row level security (RLS) to prevent users from accessing other users' events

# FERPA Compliance
- Only the student may access their academic data
- No academic data may be shared with external APIs without explicit consent

# Account Ownership Validation
- Unique constraints on emails
    - UNIQUE(AccountEmail)
- Stored procedures must verify:
    - CallerAccountID == Event.AccountID
