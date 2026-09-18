# Smart Offline Task Manager — MongoDB Edition

Offline-first PWA + NestJS + MongoDB (Mongoose) — migrated from Prisma/Postgres per request.

## Stack
- **Frontend**: React 19 + React Router 7 + TypeScript + Vite + Tailwind + Dexie (IndexedDB) + vite-plugin-pwa
- **Priority**: exact spec 15+/7-14/3-6/1-2/today/overdue with ceil-day + isSameDay
- **Sync**: IndexedDB offline queue ↔ MongoDB via `POST /api/sync/push` & `GET /api/sync/pull?since=` with version conflict detection (server-wins)
- **Backend**: NestJS 10 + Mongoose 8 + MongoDB 7 + JWT + Argon2 + Zod
- **Tests**: Vitest + jsdom (priorityEngine)

## Quick start

### MongoDB (local or Atlas)
```bash
# via Docker
docker compose up -d mongo
# or local mongod
# set server/.env: MONGODB_URI=mongodb://localhost:27017/smart-tasks
# Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-tasks
```

### Server
```bash
cd server
cp .env.example .env
npm install
npm run start:dev   # http://localhost:3000/api
npm run build && npm run start:prod
```

### Client
```bash
cd client
cp .env.example .env  # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev          # http://localhost:5173
npm run build        # PWA dist/
npm test             # vitest
```

### Docker (all)
```bash
docker compose up --build
# client http://localhost:5173 , server http://localhost:3000/api , mongo-express http://localhost:8081
```

## API (Mongo)
- POST /api/auth/register, /login, /refresh (JWT)
- GET /api/tasks, POST /api/tasks, GET/PATCH/DELETE /api/tasks/:id
- POST /api/tasks/:id/complete | /start | /snooze | /reschedule
- POST /api/sync/push, GET /api/sync/pull?since=

## Offline
- Create/edit/delete/complete → Dexie + syncQueue
- Shows ✓ Synced / ↻ Syncing… / ⚠ Offline — N queued (Header) + Settings sync section
- Sync on online event + manual “Sync now”

## PWA
- `vite-plugin-pwa` generateSW, precache, manifest (SmartTasks)

## Tests
```bash
cd client && npm test
```
