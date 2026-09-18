# Smart Tasks Server — MongoDB

NestJS + Mongoose + JWT + Argon2 + Zod

```bash
cp .env.example .env
# set MONGODB_URI=mongodb://localhost:27017/smart-tasks or Atlas URI
npm install
npm run start:dev
# API at http://localhost:3000/api
```

APIs:
- POST /api/auth/register {name,email,password}
- POST /api/auth/login {email,password}
- POST /api/auth/refresh (Bearer)
- GET /api/tasks (Bearer)
- POST /api/tasks (Bearer)
- GET /api/tasks/:id
- PATCH /api/tasks/:id
- DELETE /api/tasks/:id
- POST /api/tasks/:id/complete | /start | /snooze {minutes} | /reschedule {dueDate,dueTime}
- POST /api/sync/push {changes:[{taskId,operation,payload,version,timestamp}]}
- GET /api/sync/pull?since=timestamp

Mongo collections: users, tasks, devices
Tasks use version + clientId for offline conflict detection.
