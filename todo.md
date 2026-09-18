# Smart Offline Task Manager

## 1. Project Overview

**Smart Offline Task Manager** is an offline-first, cross-device task management Progressive Web App (PWA) designed to reduce the amount of manual task management required from the user.

Unlike a traditional Todo application where the user manually assigns priorities and repeatedly checks deadlines, this system automatically determines task urgency from the remaining time before the deadline and dynamically adjusts reminder frequency.

The application is designed for:

- Windows laptops
- Android phones
- Other modern browsers/devices that support PWA features

The application continues to work without an internet connection. Each device maintains a local copy of the user's tasks, and changes are synchronized with the central server when connectivity becomes available.

### Core Philosophy

> **Minimum input from the user, maximum automation from the system.**

The user mainly provides:

1. Task title
2. Due date
3. Due time
4. Optional link

The system handles:

- Automatic priority calculation
- Priority escalation
- Reminder scheduling
- Notification frequency
- Quiet hours
- Cross-device synchronization
- Conflict detection
- Notification actions
- Overdue handling

---

# 2. Problem Being Solved

Traditional Todo applications generally require the user to:

- Manually assign priorities
- Constantly check deadlines
- Remember when to start a task
- Open the application to update task status
- Manually synchronize information between devices
- Depend heavily on internet connectivity

For example:

> Complete CN Assignment — Due tomorrow at 6:00 PM.

A conventional Todo application may simply show:

> Due tomorrow

The Smart Offline Task Manager instead understands that the deadline is approaching and automatically increases the task's urgency.

The task may progress:

```text
LOW
  ↓
MEDIUM
  ↓
HIGH
  ↓
VERY HIGH
  ↓
CRITICAL
  ↓
OVERDUE
```

The reminder frequency changes accordingly.

---

# 3. Main User Experience

The application should deliberately have a **simple and clean interface**.

It should **not** put every feature into one giant page.

Instead, the application uses multiple dynamically routed pages. Each major function has its own page, while reusable components are shared across pages.

The UI principle is:

> **Separate pages, simple interfaces, shared components.**

---

# 4. Task Input

The primary task creation interface should use separate, simple input fields rather than requiring the user to write a long natural-language sentence.

Example:

```text
┌─────────────────────────────────────────────┐
│ Add a task                                  │
│                                             │
│ Complete CN Assignment                      │
│                                             │
│ 📅 Sep 30       🕐 6:00 PM       🔗         │
│                                             │
│                         + Add Task           │
└─────────────────────────────────────────────┘
```

### Required Fields

- Task title
- Due date
- Due time

### Optional Field

- Link

The user does **not** manually enter priority.

Priority is calculated automatically.

---

# 5. Optional Link Integration

Each task can optionally contain a URL.

Examples:

- College assignment portal
- Google Drive
- GitHub repository
- YouTube tutorial
- Documentation
- Project website

Example:

```text
Task:
Submit CN Assignment

Due:
September 20 — 6:00 PM

Link:
CN Assignment Portal
```

The link can be displayed:

- On the task details page
- Inside the task
- In notifications
- Through the Start action

The system can optionally generate a display name from the website domain.

---

# 6. UI Architecture

The application should **NOT** place all functionality on a single page.

It should use a **multi-page SPA architecture with React Router**.

The browser still behaves like a modern single-page application, but navigation changes the active page/route without requiring a full browser reload.

## Route Structure

```text
Smart Task Manager
│
├── /login
│
├── /dashboard
│
├── /tasks
│   ├── /tasks/today
│   ├── /tasks/upcoming
│   ├── /tasks/overdue
│   └── /tasks/completed
│
├── /tasks/new
├── /tasks/:taskId
├── /tasks/:taskId/edit
│
├── /calendar
├── /focus
├── /statistics
└── /settings
```

---

# 7. Dynamic Navigation

The dashboard acts as the starting point rather than containing every feature.

For example:

```text
Dashboard
   │
   ├── Click "Today"
   │       ↓
   │   /tasks/today
   │
   ├── Click "Upcoming"
   │       ↓
   │   /tasks/upcoming
   │
   ├── Click "Overdue"
   │       ↓
   │   /tasks/overdue
   │
   ├── Click a Task
   │       ↓
   │   /tasks/:taskId
   │
   ├── Click "+ Add Task"
   │       ↓
   │   /tasks/new
   │
   ├── Click Calendar
   │       ↓
   │   /calendar
   │
   └── Click Settings
           ↓
       /settings
```

Each feature is therefore loaded/displayed when the user selects it.

---

# 8. Dashboard Page

Route:

```text
/dashboard
```

The dashboard should provide a concise overview.

It should not contain every task-management feature.

Example:

```text
┌──────────────────────────────────────────┐
│ Smart Tasks                         ⚙    │
│                                          │
│ Good morning!                            │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │    3     │ │    5     │ │    1     │  │
│ │  Today   │ │ Upcoming │ │ Overdue  │  │
│ └──────────┘ └──────────┘ └──────────┘  │
│                                          │
│ 🔴 Complete CN Assignment                │
│    Due tomorrow                          │
│                                          │
│ 🟠 DBMS Record                           │
│    Due in 4 days                         │
│                                          │
│                    + Add Task            │
└──────────────────────────────────────────┘
```

Clicking any summary card navigates to its corresponding page.

---

# 9. Tasks Page

Route:

```text
/tasks
```

Provides the overall task-management view.

Possible navigation:

```text
All
Today
Upcoming
Overdue
Completed
```

Each selection navigates to its respective route rather than expanding every section on the same page.

---

# 10. Today Page

Route:

```text
/tasks/today
```

Displays tasks whose relevant deadline falls today.

Example:

```text
← Today

🚨 CRITICAL
Submit CN Assignment
Due 6:00 PM

🔴 VERY HIGH
Complete DBMS Record
Due 9:00 PM
```

---

# 11. Upcoming Page

Route:

```text
/tasks/upcoming
```

Displays active tasks that are not due today and are not overdue.

Tasks still display their automatically calculated priority.

---

# 12. Overdue Page

Route:

```text
/tasks/overdue
```

Displays tasks whose deadlines have passed and which are not completed or cancelled.

Example:

```text
← Overdue

⚠️ OVERDUE
Complete Project Report
Was due Sep 17, 6:00 PM
```

---

# 13. Completed Page

Route:

```text
/tasks/completed
```

Displays completed tasks separately from active tasks.

---

# 14. Create Task Page

Route:

```text
/tasks/new
```

Example:

```text
┌──────────────────────────────────────┐
│ ← Add Task                           │
│                                      │
│ Task title                           │
│ ┌──────────────────────────────────┐ │
│ │ Complete CN Assignment           │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Due Date                             │
│ [ September 20, 2026 ]              │
│                                      │
│ Due Time                             │
│ [ 6:00 PM ]                         │
│                                      │
│ Optional Link                        │
│ [ https://... ]                     │
│                                      │
│              [ Add Task ]            │
└──────────────────────────────────────┘
```

Priority is not entered here.

After the task is created, the priority engine calculates its current priority automatically.

---

# 15. Task Details Page

Route:

```text
/tasks/:taskId
```

The `:taskId` parameter identifies the selected task.

Example:

```text
← Back

Complete CN Assignment

🔴 VERY HIGH

Due
September 20, 2026
6:00 PM

Status
🔵 In Progress

🔗 CN Assignment Portal

────────────────────────

[▶ Start]    [✓ Complete]

[⏸ Snooze]   [📅 Reschedule]

────────────────────────

Created Sep 15
Last updated Sep 18
```

---

# 16. Edit Task Page

Route:

```text
/tasks/:taskId/edit
```

The selected task's existing information is loaded into the form.

If the deadline changes, the priority engine automatically recalculates the task's priority.

---

# 17. Calendar Page

Route:

```text
/calendar
```

Provides a calendar-based view of tasks.

Selecting a date can navigate to a relevant task/date view.

Calendar functionality is an additional view and does not replace the main task pages.

---

# 18. Focus Mode

Route:

```text
/focus
```

Focus Mode displays the most relevant tasks based on urgency.

Example:

```text
Focus Mode

🚨 CRITICAL
Submit Assignment

🔴 VERY HIGH
Prepare Presentation

[Start Focus Session]
```

---

# 19. Statistics Page

Route:

```text
/statistics
```

Possible information:

- Completed tasks
- Overdue tasks
- Completion rate
- Average completion time
- Priority distribution
- Task completion trends

Statistics are secondary and should not clutter the main dashboard.

---

# 20. Settings Page

Route:

```text
/settings
```

Possible sections:

```text
Account
Notifications
Quiet Hours
Priority Rules
Connected Devices
Synchronization
Appearance
```

---

# 21. React Router Architecture

React Router controls navigation between pages.

Conceptually:

```text
Browser URL
     ↓
React Router
     ↓
Route Matching
     ↓
Corresponding Page Component
     ↓
Page-specific Components
```

Example:

```text
/tasks/abc123
       ↓
React Router
       ↓
TaskDetails.tsx
       ↓
Task ID = abc123
       ↓
Load task from IndexedDB
       ↓
Display Task Details
```

---

# 22. Suggested Frontend Structure

```text
client/src/
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── TodayTasks.tsx
│   ├── UpcomingTasks.tsx
│   ├── OverdueTasks.tsx
│   ├── CompletedTasks.tsx
│   ├── CreateTask.tsx
│   ├── TaskDetails.tsx
│   ├── EditTask.tsx
│   ├── Calendar.tsx
│   ├── FocusMode.tsx
│   ├── Statistics.tsx
│   └── Settings.tsx
│
├── components/
│   ├── TaskCard.tsx
│   ├── PriorityBadge.tsx
│   ├── TaskStatus.tsx
│   ├── TaskForm.tsx
│   ├── NotificationPreview.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
│
├── routes/
│   └── AppRoutes.tsx
│
├── db/
│   └── database.ts
│
├── sync/
│   └── syncEngine.ts
│
├── priority/
│   └── priorityEngine.ts
│
└── notifications/
    └── notificationManager.ts
```

---

# 23. Automatic Priority System

Priority is **fully automated**.

The user does not manually assign:

- Low
- Medium
- High
- Very High
- Critical

The system determines the priority from the remaining time before the deadline.

## Default Rules

| Remaining Time | Priority | Display |
|---|---|---|
| 15+ days | Low | Green |
| 7–14 days | Medium | Yellow |
| 3–6 days | High | Orange |
| 1–2 days | Very High | Red |
| Due today | Critical | Strong Red |
| Past deadline | Overdue | Overdue styling |

These thresholds can later become configurable.

---

# 24. Priority Calculation Flow

```text
Deadline
    ↓
Current Local Time
    ↓
Time Remaining
    ↓
Priority Engine
    ↓
Current Priority
```

Example:

```text
Current:
September 18 — 10:00 AM

Deadline:
September 30 — 6:00 PM

Remaining time
       ↓
Priority = LOW
```

The calculation is performed locally so it continues working offline.

---

# 25. Dynamic Priority Escalation

Priority changes automatically as time passes.

Example:

```text
15 days remaining
       ↓
LOW

10 days remaining
       ↓
MEDIUM

5 days remaining
       ↓
HIGH

2 days remaining
       ↓
VERY HIGH

Due today
       ↓
CRITICAL

Deadline passed
       ↓
OVERDUE
```

The user does not need to edit the task.

---

# 26. Dynamic Notification System

Notifications are directly connected to the current priority.

The system does not send the same reminder frequency for every task.

## Reminder Behavior

| Priority | Notification Frequency |
|---|---|
| Low | No frequent reminder / optional weekly |
| Medium | Once daily |
| High | Once daily |
| Very High | Every 4 hours |
| Critical | Every 4 hours |
| Overdue | Separate overdue reminder schedule |

The system becomes more persistent as a deadline approaches.

---

# 27. Quiet Hours

Regular task notifications should be delivered only between:

```text
7:00 AM → 11:00 PM
```

No regular notifications should be sent between:

```text
11:00 PM → 7:00 AM
```

Example:

```text
Scheduled reminder:
2:30 AM

        ↓

Quiet hours detected

        ↓

Notification suppressed

        ↓

Next allowed time:
7:00 AM
```

The scheduler should resume reminders when the allowed notification window begins.

---

# 28. Interactive Notifications

Notifications should not be simple alerts.

Example:

```text
🔴 VERY HIGH PRIORITY

Complete CN Assignment

Due tomorrow at 6:00 PM

🔗 Open Assignment

[✓ Done] [▶ Start] [⏸ Snooze] [📅 Reschedule]
```

The notification acts as a small task-control interface.

---

# 29. Notification Actions

## Done

When the user clicks:

```text
✓ Done
```

The application:

1. Changes the task status to Completed
2. Records completion time
3. Cancels future reminders
4. Synchronizes the change when online

---

## Start

When the user clicks:

```text
▶ Start
```

The application:

1. Changes status to In Progress
2. Opens the application
3. Optionally opens the associated task link

---

## Snooze

Snooze postpones the reminder without necessarily changing the task deadline.

Possible choices:

```text
30 minutes
1 hour
4 hours
Tomorrow
```

---

## Reschedule

Reschedule changes the actual task deadline.

Example:

```text
Original:
September 20 — 6:00 PM

New:
September 22 — 6:00 PM
```

The priority engine recalculates the task after the deadline changes.

---

# 30. Task Status

Task status and notification actions are separate concepts.

## Task statuses

```text
⭕ Not Started
🔵 In Progress
✅ Completed
🚫 Cancelled
```

### Not Started

The task exists but work has not started.

### In Progress

The user has started working on it.

### Completed

The task has been completed.

### Cancelled

The task is no longer required.

---

# 31. Smart Start

Smart Start is an advanced feature.

The problem:

> A reminder at 5:30 PM for a task due at 6:00 PM is not useful if the task normally takes two hours.

Smart Start can eventually consider:

```text
Deadline
+
Estimated Duration
+
Current Priority
=
Recommended Start Time
```

Example:

```text
Deadline:
6:00 PM

Estimated duration:
2 hours

Recommended start:
3:30 PM
```

The user should **not** be required to enter a duration every time.

Possible future approaches:

- Default duration by task category
- User-defined defaults
- Learn from previous completion times
- Optional duration for important tasks

Smart Start is an advanced feature and does not need to be part of the first MVP.

---

# 32. Offline-First Architecture

Offline operation is a core requirement.

The following should work without internet:

- Create tasks
- Edit tasks
- Delete tasks
- Complete tasks
- Change status
- Add links
- Edit links
- Search tasks
- Filter tasks
- Calculate priority
- Calculate reminder schedules
- View tasks

Internet is not required for normal task management.

---

# 33. Local Data Storage

Each device maintains its own local copy of task data.

```text
             Cloud Server
                  │
             Sync Engine
              ↙       ↘
         Laptop       Phone
            │            │
        IndexedDB    IndexedDB
```

The browser uses **IndexedDB** for persistent local storage.

**Dexie.js** provides a developer-friendly abstraction over IndexedDB.

---

# 34. Offline Task Creation

Suppose the user creates a task while the phone has no internet.

```text
Create Task
     ↓
Save to IndexedDB
     ↓
Task immediately appears
     ↓
Add change to Sync Queue
```

The task is usable immediately.

---

# 35. Synchronization

When the device becomes connected:

```text
Internet detected
       ↓
Sync Queue starts
       ↓
Send local changes
       ↓
Server validates changes
       ↓
Server stores changes
       ↓
Download changes from other devices
       ↓
Update local IndexedDB
```

---

# 36. Cross-Device Example

### Step 1 — Phone is offline

User creates:

```text
Complete DBMS Assignment
Due: Sep 25, 6 PM
```

The task is stored locally.

### Step 2 — Phone reconnects

The task is uploaded to the server.

### Step 3 — Laptop connects

The laptop downloads the task.

### Step 4 — Laptop completes the task

The user clicks:

```text
✓ Done
```

### Step 5 — Phone reconnects

The completion status synchronizes back.

Result:

```text
Phone:    Completed
Laptop:   Completed
Server:   Completed
```

---

# 37. Conflict Handling

Offline synchronization creates an important distributed-state problem.

Example:

```text
Laptop:
Deadline = Sep 30

Phone:
Deadline = Oct 1
```

Both devices changed the same task while offline.

The system should not blindly overwrite one change.

It should use:

- Stable task IDs
- Version numbers
- Updated timestamps
- Device/change identifiers
- Conflict detection
- Defined resolution rules

Conceptually:

```text
Local Change
     ↓
Version Check
     ↓
Conflict?
   ↙     ↘
 No       Yes
 ↓          ↓
Apply     Resolve
```

A future UI could show:

```text
Conflict detected

Laptop changed deadline to:
Sep 30, 6:00 PM

Phone changed deadline to:
Oct 1, 6:00 PM

[Keep Laptop]
[Keep Phone]
```

---

# 38. Local Priority Calculation

Priority calculation should not depend entirely on the server.

The device can calculate it locally.

```text
Local Current Time
       ↓
Task Deadline
       ↓
Time Remaining
       ↓
Priority Engine
       ↓
Priority
       ↓
Reminder Schedule
```

This is essential for offline functionality.

---

# 39. PWA Architecture

The application should be built as a **Progressive Web App**.

## Laptop

```text
Browser
   ↓
Install PWA
   ↓
Desktop application-like experience
```

## Android

```text
Compatible Browser
       ↓
Install / Add to Home Screen
       ↓
Task Manager App
```

The same application can therefore serve both devices.

---

# 40. Overall System Architecture

```text
                         SMART OFFLINE
                         TASK MANAGER
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        React PWA                         NestJS API
             │                                 │
      ┌──────┴──────┐                  ┌───────┴────────┐
      │             │                  │                │
   React Router  Service Worker     Prisma            Auth
      │             │                  │
   Dexie.js       Web Push         PostgreSQL
      │
  IndexedDB
      │
  Sync Queue
      │
      └──────────────→ API
                         │
                       Redis
                         │
                      BullMQ
                         │
                Notification Worker
                         │
                      Web Push
                         │
                  ┌──────┴──────┐
                  ↓             ↓
                Phone         Laptop
```

---

# 41. Final Technology Stack

## Frontend

### React

Used to build the user interface.

Why:

- Component-based architecture
- Large ecosystem
- Strong industry relevance
- Suitable for state-driven interfaces
- Good PWA support

### React Router

Used for dynamic page navigation.

Why:

- Separate routes for major features
- Dynamic task-detail URLs
- Clean navigation
- Maintains SPA behavior
- Supports nested routes

### TypeScript

Used throughout the frontend and backend.

Why:

- Type safety
- Better maintainability
- Better API integration
- Strong developer tooling

### Vite

Used as the frontend build tool.

Why:

- Fast development server
- Fast builds
- Simple configuration
- Excellent React support

### Tailwind CSS

Used for UI styling.

Why:

- Fast UI development
- Consistent design
- Responsive layouts
- Suitable for minimalist interfaces

---

# 42. Local Database Stack

## IndexedDB

Browser-native persistent database.

Used for:

- Offline tasks
- Local task state
- Sync queue
- User preferences
- Cached application data

## Dexie.js

Abstraction layer over IndexedDB.

Used to simplify:

- Queries
- Transactions
- Schema management
- Offline data operations

---

# 43. PWA Technologies

## Service Worker

Responsible for:

- Offline application caching
- Push notification handling
- Network fallback
- Background web capabilities supported by the platform

## Web App Manifest

Defines:

- Application name
- Icons
- Theme
- Start URL
- Display mode

This enables installation as a PWA.

---

# 44. Backend

## Node.js

Runtime environment for the backend.

## NestJS

Backend framework.

Why:

- TypeScript-first
- Modular architecture
- Dependency injection
- Controllers/services/modules
- Suitable for a serious portfolio project
- Good REST API structure

---

# 45. Database

## PostgreSQL

Primary server-side relational database.

Stores:

- Users
- Tasks
- Task statuses
- Deadlines
- Links
- Device information
- Synchronization metadata
- Notification configuration
- Version information

PostgreSQL fits the structured relational nature of the application.

---

# 46. Prisma

Prisma acts as the ORM between NestJS and PostgreSQL.

Responsibilities:

- Database schema
- Type-safe queries
- Migrations
- Relationships
- CRUD operations

---

# 47. Redis

Redis is used for fast temporary/stateful backend operations.

Possible uses:

- Notification scheduling
- Job queues
- Rate limiting
- Temporary synchronization state
- Distributed locking where required

---

# 48. BullMQ

BullMQ provides background job processing using Redis.

It is particularly useful for notifications.

```text
Task Deadline
      ↓
Priority Engine
      ↓
Reminder Schedule
      ↓
BullMQ Job
      ↓
Redis
      ↓
Notification Worker
      ↓
Web Push
```

---

# 49. Authentication and Security

## JWT

Used for authentication and API authorization.

## Refresh Tokens

Used to maintain sessions without requiring frequent logins.

## Argon2

Used to securely hash passwords.

## Zod

Used for request/input validation.

Conceptually:

```text
Client Request
      ↓
Validation
      ↓
NestJS Controller
      ↓
Service
      ↓
Database
```

---

# 50. Notification Technology

The notification system uses:

- Web Push
- Service Worker
- Notification API
- Redis
- BullMQ

The backend determines when a reminder should be sent.

The service worker receives and displays supported push notifications.

---

# 51. Notification Architecture

```text
                    Task
                      ↓
               Deadline Engine
                      ↓
                Time Remaining
                      ↓
                Priority Engine
                      ↓
              Current Priority
                      ↓
             Reminder Frequency
                      ↓
                   BullMQ
                      ↓
                    Redis
                      ↓
             Notification Worker
                      ↓
                  Web Push
                      ↓
             Service Worker
                      ↓
              User's Device
```

---

# 52. Example Notification Lifecycle

Task:

```text
Complete CN Assignment
Deadline:
September 20 — 6:00 PM
```

As the deadline approaches:

```text
HIGH
   ↓
VERY HIGH
   ↓
CRITICAL
   ↓
OVERDUE
```

The notification frequency changes with the priority.

Example critical notification:

```text
🚨 CRITICAL — Due Today

Submit CN Assignment
Due at 6:00 PM

[🔗 Open Assignment]
[✓ Done] [▶ Start] [⏸ Snooze] [📅 Reschedule]
```

Once completed:

```text
No more reminders
```

---

# 53. Conceptual Database Design

## User

```text
User
├── id
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt
```

## Task

```text
Task
├── id
├── userId
├── title
├── description
├── dueDate
├── dueTime
├── link
├── linkName
├── status
├── createdAt
├── updatedAt
├── completedAt
├── version
└── deletedAt
```

## Device

```text
Device
├── id
├── userId
├── deviceName
├── deviceType
├── pushSubscription
├── lastSyncAt
└── createdAt
```

## Sync Change

```text
SyncChange
├── id
├── taskId
├── deviceId
├── operation
├── version
├── timestamp
└── payload
```

## Notification

```text
Notification
├── id
├── taskId
├── scheduledAt
├── sentAt
├── notificationType
└── status
```

---

# 54. API Responsibilities

Possible REST APIs:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /tasks
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

POST   /tasks/:id/complete
POST   /tasks/:id/start
POST   /tasks/:id/snooze
POST   /tasks/:id/reschedule

POST   /sync/push
GET    /sync/pull

POST   /notifications/subscribe
DELETE /notifications/subscribe
```

The exact API design can be refined during implementation.

---

# 55. Frontend Responsibilities

The React application handles:

- User interface
- Dynamic routing
- Task creation
- Task editing
- Task deletion
- Task filtering
- Task searching
- Status changes
- Local priority calculation
- Local database access
- Offline operation
- Sync queue
- Sync state
- PWA installation
- Service Worker communication

---

# 56. Backend Responsibilities

The backend handles:

- Authentication
- User accounts
- Cloud task storage
- Cross-device synchronization
- Conflict detection
- Push subscription management
- Notification scheduling
- Background jobs
- Server-side validation
- Security
- API access control

---

# 57. Application Startup Flow

```text
Open Application
       ↓
Load React PWA
       ↓
React Router determines page
       ↓
Load local IndexedDB data
       ↓
Calculate current priorities
       ↓
Display page
       ↓
Check network connectivity
       ↓
If Online → Synchronize
       ↓
Update IndexedDB
       ↓
Refresh relevant UI
```

The local interface should appear without waiting for the server.

---

# 58. Sync Status UI

The application should clearly communicate synchronization state.

Examples:

```text
✓ Synced
```

```text
↻ Syncing...
```

```text
⚠ Offline — Changes saved locally
```

This is important because users need to know that offline changes have not been lost.

---

# 59. Development Phases

## Phase 1 — Offline MVP

Build:

- React
- React Router
- TypeScript
- Vite
- Tailwind CSS
- IndexedDB
- Dexie.js
- PWA
- Dynamic pages/routes
- Task creation
- Task editing
- Task deletion
- Task status
- Automatic priority
- Basic local functionality

At the end of Phase 1:

> The application works offline on one device.

---

# 60. Phase 2 — Backend and Synchronization

Add:

- Node.js
- NestJS
- PostgreSQL
- Prisma
- JWT
- Refresh Tokens
- Argon2
- Sync APIs
- Device identification
- Sync queue
- Versioning
- Conflict detection

At the end of Phase 2:

> Laptop and phone can synchronize tasks.

---

# 61. Phase 3 — Advanced Notifications

Add:

- Redis
- BullMQ
- Web Push
- Service Worker notifications
- Dynamic reminder scheduling
- Priority escalation
- Quiet hours
- Interactive notification actions
- Snooze
- Reschedule

At the end of Phase 3:

> The application automatically manages deadline reminders.

---

# 62. Phase 4 — Production Engineering

Add:

- Docker
- GitHub Actions
- Automated testing
- API documentation
- Rate limiting
- Logging
- Error handling
- Database indexing
- Improved conflict resolution
- Monitoring
- Security hardening

---

# 63. Testing Strategy

## Unit Testing

Use:

**Vitest**

Test:

- Priority calculation
- Deadline calculation
- Reminder scheduling
- Quiet-hour logic
- Task state transitions
- Sync conflict logic

Example:

```text
Input:
10 days remaining

Expected:
MEDIUM
```

---

# 64. End-to-End Testing

Use:

**Playwright**

Test workflows such as:

```text
Create Task
     ↓
Set Deadline
     ↓
Priority Calculated
     ↓
Edit Task
     ↓
Complete Task
     ↓
Future Notifications Cancelled
```

Also test offline scenarios and navigation between dynamic routes.

---

# 65. API Documentation

Use:

**Swagger / OpenAPI**

Document:

- Authentication
- Task APIs
- Sync APIs
- Notification APIs
- Device APIs

---

# 66. Docker

Docker can provide consistent development environments for:

```text
PostgreSQL
Redis
Backend
```

Example:

```text
Docker Compose
│
├── PostgreSQL
├── Redis
└── NestJS
```

---

# 67. CI/CD

Use:

**GitHub Actions**

Automate:

```text
Push Code
    ↓
Install Dependencies
    ↓
Type Checking
    ↓
Unit Tests
    ↓
Build
    ↓
Additional Checks
    ↓
Deploy
```

---

# 68. Why This Is Not Just Another Todo App

A conventional Todo application might look like:

```text
React
  ↓
REST API
  ↓
Database
```

This project introduces additional engineering challenges:

```text
React PWA
    ↓
IndexedDB
    ↓
Offline Sync Queue
    ↓
Conflict Resolution
    ↓
NestJS
    ↓
PostgreSQL
    ↓
Redis
    ↓
BullMQ
    ↓
Notification Worker
    ↓
Web Push
```

The major engineering concepts are:

- Offline-first architecture
- Distributed state synchronization
- Conflict resolution
- Dynamic deadline calculation
- Background job scheduling
- Push notifications
- Cross-device state management
- PWA architecture
- Local-first data management

---

# 69. Technologies Not Required Initially

The project should not add technologies merely to make the stack appear complicated.

The initial architecture does **not** require:

- Kafka
- Kubernetes
- GraphQL
- Microservices
- AI/LLMs
- Machine learning
- Event streaming platforms
- Complex cloud infrastructure

These technologies may be valuable in other systems, but they do not solve the core problems of this application.

The technical strength of this project should come from solving the actual offline, synchronization, scheduling, and notification problems properly.

---

# 70. PWA Limitations

A pure browser/PWA application has platform limitations regarding background execution and exact scheduled notifications.

Browsers and mobile operating systems may restrict background activity to preserve battery.

Therefore:

```text
PWA
  ↓
Good cross-platform solution
```

but:

```text
Native Android notification layer
  ↓
Potentially more reliable background scheduling
```

may eventually be preferable if extremely precise Android reminders become a requirement.

The notification system should therefore remain modular so a native notification layer can be introduced later without rebuilding the entire application.

---

# 71. Future Enhancements

## Smart Start

Automatically recommend when to begin tasks.

## Calendar Integration

Synchronize with external calendars.

## Recurring Tasks

Support:

```text
Daily
Weekly
Monthly
Custom
```

## Subtasks

Example:

```text
Complete Project
├── Research
├── Code
├── Test
└── Submit
```

## Categories

Examples:

```text
College
Personal
Projects
Work
Learning
```

## Search

Search by:

- Title
- Category
- Link
- Status
- Deadline

## Statistics

Show:

- Tasks completed
- Overdue tasks
- Completion rate
- Average completion time
- Priority distribution

## Focus Mode

Display only the most urgent tasks.

## Adaptive Duration

Learn how long similar tasks normally take based on historical completion data.

---

# 72. Final Complete Working Flow

```text
USER CREATES TASK
       ↓
Title + Date + Time + Optional Link
       ↓
Saved Immediately to IndexedDB
       ↓
Priority Engine Calculates Urgency
       ↓
Task Displayed With Priority Color
       ↓
Reminder Scheduler Determines Frequency
       ↓
Task Remains Available Offline
       ↓
Internet Becomes Available
       ↓
Sync Queue Sends Changes
       ↓
NestJS API
       ↓
PostgreSQL
       ↓
Other Devices Receive Changes
       ↓
Deadline Approaches
       ↓
Priority Automatically Escalates
       ↓
Reminder Frequency Increases
       ↓
BullMQ Schedules Notification
       ↓
Redis
       ↓
Notification Worker
       ↓
Web Push
       ↓
Phone / Laptop Notification
       ↓
User Selects:
   ├── Done
   ├── Start
   ├── Snooze
   └── Reschedule
       ↓
Task State Updated
       ↓
Future Reminders Adjusted/Cancelled
       ↓
Changes Synchronize Across Devices
```

---

# 73. Final Technology Stack

| Layer | Technology |
|---|---|
| UI | React |
| Routing | React Router |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Local Database | IndexedDB |
| IndexedDB Wrapper | Dexie.js |
| PWA | Service Worker + Web App Manifest |
| Backend Runtime | Node.js |
| Backend Framework | NestJS |
| Server Database | PostgreSQL |
| ORM | Prisma |
| Cache / Queue Backend | Redis |
| Background Jobs | BullMQ |
| Authentication | JWT + Refresh Tokens |
| Password Hashing | Argon2 |
| Validation | Zod |
| Notifications | Web Push + Notification API |
| API Documentation | Swagger / OpenAPI |
| Unit Testing | Vitest |
| E2E Testing | Playwright |
| Containers | Docker |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |

---

# 74. Project Identity

## Project Type

**Offline-first intelligent task management PWA**

## Core Technical Concepts

```text
Offline-First
Cross-Device Synchronization
Automatic Priority Escalation
Dynamic Notifications
Background Job Processing
Push Notifications
Conflict Resolution
PWA
Local-First Data
Distributed State Synchronization
Dynamic Routing
```

## Core Product Principle

> **The user tells the system what needs to be done and when it is due. The system determines how urgently the user needs to be reminded.**

The result is a simple user interface backed by a technically advanced architecture.
