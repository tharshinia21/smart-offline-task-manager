# Notification Reliability Investigation

## 1. Current Architecture

- **PWA Manifest**: `vite.config.ts` → `VitePWA` with `injectManifest`, `dist/manifest.webmanifest` valid
- **Service Worker** (`src/sw.ts`): push handler + `notificationclick` (done/start/snooze via fetch). Workbox precache only.
- **Dexie DB** (`src/db/database.ts`): tables `tasks`, `syncQueue` only — no `reminders` table.
- **Foreground notification loop** (`src/notifications/notificationManager.ts`): `setInterval 60s` tick checks priority + quiet hours + throttle via `localStorage lastNotif`. **Explicitly forbidden as primary scheduler** by todo.md §4, §14.
- **Background delivery**: depends on server `BullMQ + Redis + web-push` + VAPID + HTTPS. No local offline scheduling possible.
- **Permission**: `Notification.permission` stored in `Settings.tsx`; `requestPermission()` called once on first use.

## 2. Platform Limitations (todo.md:336-341)

| Question | Answer |
|---|---|
| Is this a standard website or installable PWA? | Installable PWA (display: standalone) |
| Is there a service worker? | Yes, but only for push delivery + precache |
| Is there a Web App Manifest? | Yes, `name`, `short_name`, `display: standalone`, icons |
| Is HTTPS/secure context available? | Required for push + VAPID; localhost works for dev only |
| Is IndexedDB already being used? | Yes, `SmartTaskDB` via Dexie (`tasks`, `syncQueue`) |
| Can the current PWA architecture reliably schedule a notification while completely closed on Android/Chrome? | **No**. SW `push` event requires server + internet + auth + VAPID + Redis. `setInterval` in App/notificationManager only works when foreground. |

**Conclusion**: A web-only PWA **cannot** guarantee exact-time closed-app reminders. The `setInterval` approach is unreliable because browsers suspend timers when the page is closed/backgrounded (§4: "Do NOT rely on setTimeout/setInterval").

## 3. Recommended Minimal Extension (todo.md:363-374)

```
Existing HTML/CSS/JavaScript
      │
  Existing PWA UI
      │
  Existing Offline Storage (Dexie)
      │
  └─▶ Lightweight Android/Capacitor Layer
               │
               └─▶ Native scheduled notifications
```

**Smallest viable native layer**: Capacitor `@capacitor/local-notifications` wrapping the existing Dexie `reminders` table. When `Capacitor.isNativePlatform()` → use native scheduler; else fall back to foreground poll + system notifications (best-effort).

## 4. Limitations Documented

- No `setInterval`/`setTimeout` as primary closed-reminder mechanism (§4)
- Background delivery requires server stack (BullMQ+Redis+VAPID+HTTPS) — not a fallback for offline
- Foreground only: bottom sheet + system notification when app open (§3, §15)
- Closed/background: system notification if permission granted + app switch (§5, §6, §16)
- Silent mode respected: no forced sound/vibrate (`todo.md:32,51`) — removed from `notificationManager.ts`
- Capacitor layer recommended for reliable background; not strictly required for MVP