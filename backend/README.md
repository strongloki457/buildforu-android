# BuildForU Backend

Secure backend foundation for the BuildForU construction company SaaS MVP.

This backend is intentionally separate from the existing frontend. It provides the API, data model, authentication, validation, and company-scoped authorization needed for the frontend integration phase.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcrypt password hashing
- Zod validation
- Helmet security headers
- CORS allowlist via `FRONTEND_URL`
- express-rate-limit
- dotenv environment loading

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

The API runs on `PORT`, defaulting to `5000` in local development.

Health check:

```bash
GET /api/health
```

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buildforu?schema=public"
JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
JWT_EXPIRES_IN="1h"
FRONTEND_URL="http://localhost:5173"
PORT=5000
NODE_ENV="development"
```

Use a long random `JWT_SECRET` in production. Do not reuse the example value.

## Seed Accounts

The seed creates:

- Admin: `admin@buildforu.com` / `admin123`
- Employee: `worker@buildforu.com` / `worker123`

Passwords are hashed with bcrypt before storage.

## API Overview

Auth:

- `POST /api/auth/register-company`
- `POST /api/auth/login`
- `GET /api/auth/me`

Workers:

- `GET /api/workers` admin only
- `POST /api/workers` admin only
- `PATCH /api/workers/:id` admin only
- `DELETE /api/workers/:id` admin only, soft-deletes worker and removes linked user login

Projects:

- `GET /api/projects` admin sees company projects, employee sees assigned projects
- `POST /api/projects` admin only
- `PATCH /api/projects/:id` admin only
- `DELETE /api/projects/:id` admin only, soft-delete
- `POST /api/projects/:id/workers` admin only, replaces project worker assignments

Tasks / Calendar:

- `GET /api/tasks` admin sees company tasks, employee sees own tasks
- `POST /api/tasks` admin only
- `PATCH /api/tasks/:id` admin can update company task, employee can update own task status only
- `DELETE /api/tasks/:id` admin only

Attendance:

- `GET /api/attendance` admin sees company attendance, employee sees own attendance
- `POST /api/attendance/start` employee only
- `POST /api/attendance/end` employee only

Material Requests:

- `GET /api/materials` admin sees company requests, employee sees own requests
- `POST /api/materials` employee or admin
- `PATCH /api/materials/:id/status` admin only
- `DELETE /api/materials/:id` admin can delete company request, employee can delete own pending request

List endpoints support `page` and `limit` query params. Tasks support optional `status`, `dateFrom`, and `dateTo`. Projects and materials support optional `status`.

## Security Notes

- `companyId` is always derived from the authenticated user/JWT context.
- Private queries are scoped by `companyId`.
- Request bodies never control tenant access.
- Password hashes are never returned from API responses.
- JWT payload includes `userId`, `role`, `companyId`, and `workerId`.
- Helmet is enabled for secure HTTP headers.
- General API rate limiting and stricter auth rate limiting are enabled.
- CORS uses `FRONTEND_URL`; wildcard origins are not used in production.
- Production errors return safe messages without stack traces.

## Backend Integration Notes

The frontend can later replace localStorage/mock calls with this API. Keep the frontend role assumptions aligned with backend permissions:

- Admin manages workers, projects, tasks, and material statuses.
- Employee sees only assigned tasks/projects, own attendance, and own material requests.
- Attendance sessions prevent duplicate active starts for the same worker.
