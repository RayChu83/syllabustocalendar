This is the app-wide Schema, Please refer to this before doing any form of coding

1. Root Layer (User System)
   auth.users (external auth system)

This is your true root. Everything ultimately belongs to a user here.

Connections:
profiles.id → auth.users.id
google_auth_tokens.user_id → auth.users.id

So every user can have:

a profile (app-level identity)
Google OAuth credentials (calendar sync layer)
profiles

Purpose: app-level user profile (display + metadata)

Fields:

id (matches auth.users.id)
name
school
created_at
Relationships:
1 → 1 with auth.users
1 → many with semesters
Meaning:

A user exists in auth, and gets a profile in your app.

2. Academic Structure Layer
   semesters

Purpose: organizes a user’s academic timeline

Fields:

id
profile (FK → profiles.id)
title (e.g. “Fall 2026”)
grade
semester (string label)
created_at
Relationships:
profiles (1) → semesters (many)
semesters (1) → classes (many)
Meaning:

A user profile contains multiple semesters.

classes

Purpose: core academic unit (a course)

Fields:

id
semester_id (FK → semesters.id)
syllabus_id (FK → syllabus.id)
title
overview
materials (jsonb)
grading (jsonb)
other (jsonb)
start_date
end_date
created_at
Relationships:
semesters (1) → classes (many)
classes (1) → instructors (many)
classes (1) → schedule (many)
classes (1) → deadlines (many)
classes (1) → syllabus (1)
classes (1) → calendar_events (indirect via schedule/deadlines)
Meaning:

This is the “center node” of your entire system.

Everything in the academic system hangs off a class.

3. Course Content Layer
   syllabus

Purpose: raw + parsed course document

Fields:

id
raw_text
file_hash
parsed_data (jsonb)
key
created_at
Relationships:
syllabus (1) → classes (1) (via classes.syllabus_id)
Meaning:

A class optionally has a syllabus that powers structured extraction:

assignments
schedule hints
materials
deadlines
instructors

Purpose: people teaching a class

Fields:

id
class_id (FK → classes.id)
name
email (jsonb)
role
office_hours (jsonb)
created_at
Relationships:
classes (1) → instructors (many)
Meaning:

Each class can have multiple instructors/TAs.

4. Scheduling Layer
   schedule

Purpose: recurring class sessions

Fields:

id
class_id (FK → classes.id)
location
start_time
end_time
meeting_days (jsonb)
additional_notes
created_at
updated_at
Relationships:
classes (1) → schedule (many)
schedule → calendar_events (dashed connection)
Meaning:

This defines “when class happens weekly”.

Example:

Mon/Wed/Fri 10:00–11:15 in Room 204
deadlines

Purpose: assignments / exams

Fields:

id
class_id (FK → classes.id)
title
due_date
due_time
created_at
updated_at
Relationships:
classes (1) → deadlines (many)
deadlines → calendar_events (dashed connection)
Meaning:

Anything graded or due:

homework
exams
projects

5. Calendar Integration Layer
   calendar_events

Purpose: synced events (Google Calendar bridge)

Fields:

id
event_id (Google event ID)
ok (sync status)
referrer_id (UUID Foreign Key)
referrer_type (enum "schedule" | "deadline")
created_at
updated_at
Relationships:
schedule → calendar_events
deadlines → calendar_events
Meaning:

This is your “sync log + mapping table”.

It tracks:

what got pushed to Google Calendar
whether it succeeded (ok)
what created it (referrer)

So:

schedule generates recurring events
deadlines generate one-off events
google_auth_tokens

Purpose: Google OAuth + calendar permissions

Fields:

user_id (FK → auth.users.id)
encrypted_refresh_token
hashed_refresh_token
iv / auth_tag (encryption metadata)
ok
avatar_url
name
email
created_at
Relationships:
auth.users (1) → google_auth_tokens (1)
Meaning:

This is your integration layer enabling:

calendar writes
user identity sync
long-term refresh token storage 6. Full Hierarchy View (Clean Mental Model)

Here’s the full structure:

USER LAYER
auth.users
├── profiles
└── google_auth_tokens
ACADEMIC STRUCTURE
profiles
└── semesters
└── classes
├── instructors
├── schedule
│ └── calendar_events
├── deadlines
│ └── calendar_events
└── syllabus 7. Key Design Insight (Important)

Your schema is actually split into 3 systems:

1. Identity system
   auth.users
   profiles
2. Academic graph
   semesters → classes → (instructors, schedule, deadlines, syllabus)
3. External sync system
   schedule/deadlines → calendar_events → google_auth_tokens
