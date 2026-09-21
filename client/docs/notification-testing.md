# Notification Testing Checklist (todo.md:18)

## App open

- [ ] Reminder fires at the configured time (foreground tick)
- [ ] Bottom sheet appears from bottom with slide animation
- [ ] **Done** works: task status → completed, localStorage/Dexie updated, future reminders cancelled
- [ ] **Dismiss** works: sheet closes, no further notification for this reminder
- [ ] **Snooze** works (5/10/15/30/60/custom min): `snoozedUntil` stored, next reminder scheduled at new time, original reminder cancelled
- [ ] **Reschedule** works: `dueDate`/`dueTime` updated, old schedule cancelled, new schedule created

## App backgrounded

- [ ] Reminder notification is delivered via system notification (where supported)
- [ ] Notification opens the correct task screen (via `notificationclick` → `/tasks/:taskId`)
- [ ] No duplicate notification occurs on app restart (dedup via `reminderId` tag + `scheduledAt`)
- [ ] Notification respects Silent mode: no forced sound, no vibration unless OS allows
- [ ] Notification respects DND: content hidden per OS settings

## App closed

- [ ] Test whether the selected platform/browser can deliver the reminder (Android Chrome + PWA install; iOS Safari limited)
- [ ] **Do not claim success unless actually supported** — document limitation (`docs/notification-limitation.md`)
- [ ] If Capacitor native layer present: native notification delivered even when app fully quit

## Phone locked

- [ ] Notification appears through lock screen (subject to OS configuration)
- [ ] No security/privacy settings are bypassed
- [ ] If OS configured to hide notification content, body text is omitted from lock screen

## Silent mode

- [ ] **No forced sound** — notification plays by OS default only
- [ ] **No forced alarm behavior** — no continuous ringing, no `Audio('/alarm.wav')`
- [ ] Normal notification behavior respected: quiet hours 11PM-7AM suppress, next allowed at 7AM
- [ ] Vibration: follows OS setting (not forced)

## Offline

- [ ] Existing locally stored tasks remain available (Dexie `tasks` table)
- [ ] Reminder configuration does not require internet (stored in `reminders` table + `scheduledAt`)
- [ ] No unnecessary API dependency introduced for local reminder detection

## Edge cases

- [ ] **App restarted**: no duplicate notification; `reminderId` + `scheduledAt` dedup prevents firing
- [ ] **Device restarted** (if supported by Capacitor layer): scheduled reminder persists or requires re-registration
- [ ] **Reminder edited** before scheduled time: old schedule cancelled, new schedule created
- [ ] **Task completed before reminder**: future reminder cancelled automatically
- [ ] **Multiple reminders at similar times**: no overlap; each has unique `reminderId`
- [ ] **Snoozed reminder**: `snoozeUntil` respected; new reminder scheduled after snooze window
- [ ] **Rescheduled reminder**: old `reminderId` job cancelled, new `reminderId` created with new `scheduledAt`
- [ ] **Notification permission denied**: gracefully disabled; banner + link to browser settings; no crash
- [ ] **Notification permission later enabled**: previously scheduled reminders may be re-enabled via Capacitor resync or manual trigger