# BuildForU

BuildForU is a construction company management web application focused on helping office teams and field crews stay aligned in one workspace. The current product is a connected MVP: authentication, workers, projects, tasks/calendar, attendance, and material requests use the local backend API.

## Overview

BuildForU is designed as an internal operations platform for construction businesses. It provides role-based access to dashboards, workforce coordination tools, scheduling views, communication features, and market/store discovery. Admin and employee sessions use backend JWT auth, and core operational data is loaded from PostgreSQL through the Express/Prisma API.

## Main Features

- Backend-connected JWT registration, login, logout, and session restore
- Admin dashboard for company-wide operations visibility
- Employee dashboard focused on personal assignments and field activity
- Workers management with optional employee login creation
- Projects with worker assignments and status updates
- Calendar/tasks with worker and project linking
- Attendance start/end tracking for employee accounts
- Team chat
- Material requests backed by the API
- Find to Buy store finder mock flow
- Multilingual UI
- Responsive design for desktop and mobile usage
- Local frontend persistence for selected language and the MVP JWT session

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Backend API integration for auth and core operational data

## Getting Started

### Installation

```bash
npm install
```

Create a frontend environment file:

```bash
cp .env.example .env
```

Set `VITE_API_URL` to the backend API URL. The local backend defaults to `http://localhost:5000`.

### Run Development Server

Start the backend first:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Then start the frontend from the repository root:

```bash
npm run dev
```

After starting the development server, open the local URL shown in the terminal.

### Production Build Check

```bash
npm run build
```

## Seed Login Accounts

- Admin: `admin@buildforu.com` / `admin123`
- Employee: `worker@buildforu.com` / `worker123`

These accounts come from the backend seed data. New employee logins created from the Workers screen call the backend workers API and show the temporary password returned once by the API.

## Project Structure

```text
src/
  assets/         Logos and static visual assets
  components/     Shared UI, navigation, dashboard, and auth guard components
  contexts/       Global app state providers such as auth, i18n, and app API data
  data/           Mock datasets still used for chat, finance, Find to Buy, and demo UI helpers
  hooks/          Custom React hooks for accessing app contexts
  i18n/           Locale dictionaries for the multilingual interface
  layouts/        Shared application shell layouts
  pages/          Route-level screens such as dashboard, login, chat, and settings
  App.jsx         Main route composition
  main.jsx        App bootstrap entry
```

## Notes

- Authentication and core operational screens are connected to the backend API through JWT.
- Workers, projects, tasks/calendar, attendance, and material requests are backend-managed.
- Chat, finance, and Find to Buy still use frontend mock data until those backend services are added.
- JWT is stored in `localStorage` for the MVP only. A production deployment should review token storage, refresh/session strategy, CSRF posture, and deployment-specific security controls.
- Backend passwords are hashed, but seed/demo passwords are not production-safe credentials.
- Access control must continue to be enforced server-side; frontend role guards are only a UI convenience.
- Start PostgreSQL before testing registration/login. Without the database on `localhost:5432`, the backend health route can respond while auth/data routes return database errors.

## Future Plans

- Add backend services for chat, finance, and Find to Buy
- Support file uploads
- Integrate real maps and geolocation services
- Add AI-powered product and store search

## Development Status

BuildForU is currently positioned as a connected SaaS MVP. The frontend uses real backend APIs for authentication and the main operational modules, with mock-only areas limited to chat, finance, and Find to Buy until the next backend phase.
