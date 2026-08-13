# BuildForU

BuildForU is a construction company management SaaS — a connected MVP for office teams and field crews. Authentication, workers, projects, tasks/calendar, attendance, material requests, and AI assistant use the local backend API backed by PostgreSQL.

## Requirements

- **Node.js 20+ LTS** (required for both frontend and backend)
- **PostgreSQL 14+** running locally or via a cloud provider
- **npm 9+**

## Feature List

- JWT registration, login, logout, and session restore (access + refresh tokens)
- Role-based views: Admin (company-wide operations) and Employee (personal assignments)
- Workers management with optional employee login creation
- Projects with worker assignments and status updates
- Calendar/tasks with worker and project linking
- Attendance start/end tracking with optional GPS location
- Team chat (frontend mock until backend services are added)
- Material requests backed by the API
- Find to Buy store finder (mock data)
- Market Map (redirects to Materials/Find to Buy)
- AI construction assistant (powered by Groq — free tier)
- Multilingual UI: English, Polish, French, German, Spanish, Italian
- Responsive design for desktop and mobile

## Quick Start

### 1 — Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, and GROQ_API_KEY
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

The backend starts on `http://localhost:5000`.

### 2 — Frontend setup

Open a second terminal in the repository root:

```bash
npm install
cp .env.example .env
# VITE_API_URL is pre-set to http://localhost:5000 for local development
npm run dev
```

The frontend starts on `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend automatically.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Access token TTL (default `15m`) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret (min 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL (default `7d`) |
| `GROQ_API_KEY` | Yes* | Groq API key for AI assistant (free at console.groq.com) |
| `PORT` | No | Backend port (default `5000`) |
| `NODE_ENV` | No | `development` / `production` |
| `FRONTEND_URL` | No | Allowed CORS origin (default `http://localhost:5173`) |
| `SMTP_HOST` | No | SMTP host for email (omit to log to console) |
| `SMTP_PORT` | No | SMTP port (default `587`) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address for emails |

*The AI assistant returns a 503 if `GROQ_API_KEY` is missing, but all other features work normally.

### Frontend (`root .env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend API base URL (default `http://localhost:5000`) |

## Seed Login Accounts

These accounts are created by `npm run seed` in the backend:

- Admin: `admin@buildforu.com` / `admin123`
- Employee: `worker@buildforu.com` / `worker123`

## Production Deployment

### Backend

```bash
cd backend
npm install --production=false
npm run build          # Compile TypeScript → dist/
npx prisma migrate deploy   # Run pending migrations (safe, no data loss)
npm start              # Runs dist/server.js
```

Required production env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GROQ_API_KEY`, `NODE_ENV=production`, `FRONTEND_URL` (your deployed frontend URL).

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend

```bash
npm run build   # Outputs to dist/
```

Serve the `dist/` folder with any static host (Nginx, Vercel, Netlify, etc.). Point API calls to your deployed backend by setting `VITE_API_URL` at build time.

### Android (Capacitor)

`capacitor.config.ts` only points the native shell at the Vite dev server (`10.0.2.2`) when `CAP_ENV=dev` is set — otherwise it loads the bundled `dist/` assets, which is what a Play Store build needs to work for real users.

```bash
npm run cap:sync:dev    # local emulator, live Vite dev server
npm run cap:sync:prod   # release build, bundled dist/ assets
```

Never build a release APK/AAB with `CAP_ENV=dev` set — the app would try to reach the developer's local machine and fail for every real user.

## Project Structure

```text
.
├── backend/
│   ├── prisma/           Prisma schema, migrations, seed
│   └── src/
│       ├── config/       env validation, Prisma client
│       ├── controllers/  Route handler functions
│       ├── middleware/   auth, role, error middleware
│       ├── routes/       Express routers
│       ├── services/     Business logic
│       ├── utils/        JWT, password, error helpers
│       └── validators/   Zod input schemas
└── src/                  React frontend
    ├── api/              Typed API client functions
    ├── components/       Shared UI, dashboard, navigation
    ├── contexts/         Auth, i18n, app-data providers
    ├── hooks/            Custom React hooks
    ├── i18n/locales/     Translation files (en, pl, fr, de, es, it)
    ├── pages/            Route-level screens
    └── utils/            Frontend helpers
```

## Security Notes

- JWT is stored in `localStorage` for the MVP. A production deployment should review token storage, refresh strategy, and CSRF posture.
- Backend passwords are bcryptjs-hashed (12 rounds). Seed/demo passwords are not production-safe.
- `passwordHash` is never returned by any API endpoint.
- Stack traces are suppressed in `NODE_ENV=production` error responses.
- Rate limits: 300 req/15 min globally, 20 req/15 min on `/api/ai/chat`.
- AI assistant errors and provider details are never exposed to the client.
