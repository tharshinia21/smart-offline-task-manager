# Offline Background Reminder & Notification System
## Objective
Implement a reliable reminder system for the existing offline-first task manager application.

The application is currently built using **HTML, CSS, and JavaScript** and primarily runs in **Chrome as a PWA**. Do **not** rewrite the existing application or convert the entire project into a traditional Android application unless it is technically necessary for reliable background scheduling.

The goal is to make task reminders work even when:

- the PWA is not currently open,
- the user is using another application,
- the screen is locked,
- and the PWA/browser page has been closed.

The reminder must behave like a **normal notification/reminder**, NOT like an alarm clock.

---

## 1. Reminder Behavior

When a user creates or edits a task, they should be able to configure a reminder date and time.

Example:

> Task: Complete Java Assignment
> Reminder: 7:30 PM

At the scheduled time, the application should trigger a reminder.

The reminder should be associated with the correct task and should contain enough information for the user to understand what needs to be done.

---

## 2. This Is NOT an Alarm Clock

Do **not** implement the reminder as an alarm-clock-style alert.

The reminder must:

- respect the phone's normal notification behavior,
- respect Silent mode,
- respect normal notification sound settings,
- respect vibration settings,
- respect Do Not Disturb/system notification policies,
- never force the device speaker to play a sound,
- never bypass Silent mode,
- never continuously ring,
- never behave like an emergency/alarm notification.

If the phone is silent, the reminder should remain silent.

If the phone is configured to vibrate for notifications, it should follow that behavior.

If normal notification sounds are enabled, it may use the normal notification sound.

---

## 3. When the PWA Is Open

When the user is currently using the application at the reminder time, display a **custom bottom-sheet reminder UI**.

Do NOT use a simple browser alert such as:

```javascript
alert("Reminder");
```

Instead, create a polished, responsive bottom-sheet component that slides upward from the bottom of the screen.

Example:

```text
┌─────────────────────────────────┐
│                                 │
│          Application UI         │
│                                 │
├─────────────────────────────────┤
│ 🔔  Task Reminder               │
│                                 │
│ Complete Java Assignment        │
│ Due now                         │
│                                 │
│ [ ✓ Done ]   [ Snooze ]         │
│                                 │
│        [ Reschedule ]            │
│                                 │
└─────────────────────────────────┘
```

The bottom sheet should provide at least:

- **Done**
- **Snooze**
- **Reschedule**
- **Dismiss**

The exact visual design should match the existing application's UI rather than introducing an unrelated design system.

---

## 4. When the PWA Is Closed

This is a critical requirement.

The reminder must not depend on the webpage remaining open.

Do NOT rely on:

```javascript
setTimeout()
setInterval()
```

as the primary scheduling mechanism.

A browser page can be suspended or terminated, so these methods are not reliable for closed-app reminders.

Investigate the appropriate browser/PWA notification and background mechanisms available on the target platform.

If the current PWA architecture cannot reliably schedule and deliver a reminder while the application is completely closed, **do not fake the implementation**.

Instead:

1. Clearly identify the browser/PWA limitation.
2. Preserve the existing PWA architecture.
3. Propose the smallest possible native Android integration required for reliable background scheduling.
4. Prefer a solution such as a lightweight **Capacitor/native Android layer** around the existing HTML/CSS/JavaScript application rather than rewriting the application.
5. Keep the existing frontend and offline data architecture wherever possible.

---

## 5. When the User Is Using Another App

Example:

```text
User schedules reminder → 7:30 PM

At 7:30 PM:
User is watching YouTube
        ↓
Reminder notification appears
        ↓
User can tap the notification
        ↓
Application opens
        ↓
The relevant task/reminder is displayed
```

The application must NOT attempt to draw a custom HTML bottom sheet over another application.

A normal PWA cannot arbitrarily display custom UI over another Android application.

Therefore:

- while the PWA is open → show the custom bottom-sheet;
- while the PWA is closed/backgrounded → use the system notification mechanism;
- when the user taps the notification → open the PWA/application and show the relevant task/reminder screen or bottom-sheet.

---

## 6. Lock Screen Behavior

The reminder should be capable of appearing through the operating system's normal notification mechanism when the device is locked, subject to Android/Chrome/PWA platform restrictions.

Do not attempt to bypass Android's lock-screen security.

The notification should follow the user's existing notification/privacy settings.

Do not expose sensitive task information on the lock screen if the operating system is configured to hide notification content.

---

## 7. Notification Actions

Where supported by the platform, provide useful notification actions such as:

- Done
- Snooze
- Open Task
- Reschedule

These actions should update the task/reminder state correctly.

For example:

```text
Reminder notification
────────────────────────────
📚 Complete Java Assignment

[Done] [Snooze] [Open]
```

If a particular notification action is not supported by the current PWA/browser environment, implement the closest reliable behavior rather than creating a fake action.

---

## 8. Snooze

Implement configurable snooze functionality.

Example options:

- 5 minutes
- 10 minutes
- 15 minutes
- 30 minutes
- 1 hour
- Custom time

When the user selects Snooze:

1. Mark the current reminder as snoozed.
2. Store the new reminder time.
3. Schedule the next reminder using the supported scheduling mechanism.
4. Prevent duplicate notifications for the original reminder.

---

## 9. Reschedule

The user must be able to change the reminder date/time.

When a reminder is rescheduled:

- cancel/replace the previous scheduled reminder,
- store the new date/time,
- create the new schedule,
- prevent the old reminder from firing.

---

## 10. Offline Requirement

The reminder system must work with the application's offline-first architecture.

Task/reminder data should be stored locally.

The application must not require an internet connection simply to determine that a locally scheduled reminder exists.

Do not make a remote server/API call a mandatory dependency for local reminders.

The existing local storage/database architecture should be inspected first.

If IndexedDB is already used, prefer using the existing IndexedDB structure instead of introducing another unnecessary database.

---

## 11. Duplicate Prevention

The system must prevent duplicate reminders.

For every reminder, maintain a unique identifier.

Example:

```text
reminderId
taskId
scheduledAt
status
snoozeUntil
```

The system should ensure that:

- the same reminder is not scheduled twice,
- reopening the application does not create duplicate notifications,
- rescheduling removes/replaces the previous schedule,
- snoozing does not leave the original reminder active,
- completing a task cancels any future reminder associated with it.

---

## 12. Time and Date Handling

Handle dates and times carefully.

Requirements:

- use the device's local time zone for user-facing reminders,
- avoid manually adding/subtracting fixed timezone offsets,
- correctly handle date changes,
- correctly handle reminders scheduled for the next day,
- correctly handle past reminders,
- avoid duplicate firing after application restart.

Store timestamps in a consistent format internally and convert them to local time for display.

---

## 13. Permission Handling

The application must request notification permission properly.

Do not repeatedly ask for notification permission.

Create an appropriate settings/state flow such as:

```text
Notifications
────────────────────────
✓ Notifications enabled

Reminder notifications
[ ON ]

Default snooze
[ 10 minutes ]

Test notification
[ Send test ]
```

If permission is denied:

- explain that notifications are disabled,
- provide a clear path to application/browser notification settings where possible,
- do not crash,
- do not pretend reminders are functioning when they cannot be delivered.

---

## 14. Notification Reliability

Before implementing the final solution, inspect the current project and determine:

1. Is this currently a standard website or an installable PWA?
2. Is there already a service worker?
3. Is there already a Web App Manifest?
4. Is HTTPS/secure context available?
5. Is IndexedDB already being used?
6. Is there an existing notification implementation?
7. What browsers/devices are being targeted?
8. Can the current PWA architecture reliably schedule a notification while completely closed on the target Android/Chrome environment?

Do not assume that a service worker alone provides arbitrary exact-time background timers.

Do not claim that a web-only implementation can guarantee exact closed-app reminders if the platform does not support that behavior.

---

## 15. Preferred Architecture

First attempt to keep the architecture web/PWA-based:

```text
Existing HTML/CSS/JavaScript
            │
            ├── Task Manager UI
            │
            ├── Local Database
            │      └── Tasks + Reminders
            │
            ├── PWA Manifest
            │
            ├── Service Worker
            │
            └── Notification Layer
```

If reliable closed-app scheduling is not possible with the current PWA/Chrome capabilities, extend it minimally:

```text
Existing HTML/CSS/JavaScript
            │
            ├── Existing PWA UI
            ├── Existing Offline Storage
            │
            └── Lightweight Android/Capacitor Layer
                         │
                         └── Native scheduled notifications
```

Do NOT rewrite the frontend unnecessarily.

---

## 16. Important Platform Constraint

Do not promise this behavior:

> "A PWA can always display a custom HTML popup over Instagram, YouTube, or any other application."

That is not how normal web/PWA security works.

The correct behavior is:

```text
PWA open
    ↓
Custom bottom-sheet

PWA closed/backgrounded
    ↓
System notification
    ↓
User taps notification
    ↓
PWA/application opens
    ↓
Custom bottom-sheet/task view
```

If a native Android layer is introduced, investigate whether Android's supported notification APIs can provide a richer notification experience without violating normal notification behavior.

Do not use intrusive overlay permissions unless there is a compelling, documented requirement and the user explicitly opts into such functionality.

---

## 17. UI/UX Requirements

The reminder experience should feel like part of the existing application.

The bottom sheet should:

- animate smoothly from the bottom,
- have clear task information,
- show the scheduled/reminder time where useful,
- have large touch-friendly buttons,
- work on small phone screens,
- support dark/light themes if the application already supports them,
- be accessible,
- not block the entire application unnecessarily,
- close cleanly after Done/Dismiss,
- restore correctly if the app is reopened.

---

## 18. Testing Requirements

Create a testing checklist covering:

### App open

- [ ] Reminder fires at the configured time.
- [ ] Bottom sheet appears.
- [ ] Done works.
- [ ] Dismiss works.
- [ ] Snooze works.
- [ ] Reschedule works.

### App backgrounded

- [ ] Reminder notification is delivered where supported.
- [ ] Notification opens the correct task.
- [ ] No duplicate notification occurs.

### App closed

- [ ] Test whether the selected platform/browser can deliver the reminder.
- [ ] Do not claim success unless it is actually supported/tested.

### Phone locked

- [ ] Notification follows Android lock-screen settings.
- [ ] No security/privacy settings are bypassed.

### Silent mode

- [ ] No forced sound.
- [ ] No forced alarm behavior.
- [ ] Normal notification behavior is respected.

### Offline

- [ ] Existing locally stored tasks remain available.
- [ ] Reminder configuration does not require internet.
- [ ] No unnecessary API dependency is introduced.

### Edge cases

- [ ] App restarted.
- [ ] Device restarted, if supported by the chosen implementation.
- [ ] Reminder edited.
- [ ] Task completed before reminder.
- [ ] Multiple reminders at similar times.
- [ ] Snoozed reminder.
- [ ] Rescheduled reminder.
- [ ] Notification permission denied.
- [ ] Notification permission later enabled.

---

## 19. Development Instructions for OpenCode

Before changing code:

1. Inspect the entire existing project structure.
2. Identify the current frontend architecture.
3. Identify the current storage/database implementation.
4. Identify whether a service worker already exists.
5. Identify the PWA manifest.
6. Identify the current routing/navigation system.
7. Identify any existing notification/reminder code.
8. Explain the minimum changes required.
9. Do not rewrite unrelated features.
10. Preserve the existing UI and functionality.

Then implement the reminder system incrementally.

After implementation:

- explain which files were changed,
- explain why each change was made,
- identify any browser/Android limitations,
- provide exact steps for testing on an Android phone,
- do not mark the feature as fully reliable unless the target environment has actually been tested.

## Final Goal

Build a **reliable offline task reminder system** that behaves like a normal notification rather than an alarm.

The desired user experience is:

```text
Create Task
     ↓
Set Reminder
     ↓
Store locally
     ↓
Wait until scheduled time
     ↓
┌──────────────────────────────┐
│ If app is open               │
│ → Custom bottom-sheet        │
└──────────────────────────────┘

┌──────────────────────────────┐
│ If app is closed/background  │
│ → System notification        │
│ → Tap notification            │
│ → Open app + show task        │
└──────────────────────────────┘
```

The system must prioritize **reliability, offline functionality, normal Android notification behavior, and respect for Silent mode** over attempting unsupported browser behavior.
