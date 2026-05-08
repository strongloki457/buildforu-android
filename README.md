# BuildForU

BuildForU is a construction company management web application focused on helping office teams and field crews stay aligned in one workspace. The current product is a frontend-only MVP that uses mock and `localStorage` data, with separate experiences for Boss/Admin and Employee roles.

## Overview

BuildForU is designed as an internal operations platform for construction businesses. It provides role-based access to dashboards, workforce coordination tools, scheduling views, communication features, and market/store discovery. At this stage, the app is a frontend prototype that demonstrates product direction, UI structure, and user flows before backend integration.

## Main Features

- Role-based mock login flow for Boss/Admin and Employee users
- Admin dashboard for company-wide operations visibility
- Employee dashboard focused on personal assignments and field activity
- Workers management interface
- Calendar and schedule overview
- Task management
- Team chat
- Materials requests and Find to Buy store finder
- Multilingual UI
- Responsive design for desktop and mobile usage
- Local frontend persistence for users, sessions, workers, projects, tasks, attendance, materials, and selected language

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Mock data / frontend-only architecture for the current stage

## Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

After starting the development server, open the local URL shown in the terminal.

### Production Build Check

```bash
npm run build
```

## Example Mock Login Accounts

- Admin: `admin@buildforu.com` / `admin123`
- Employee: `worker@buildforu.com` / `worker123`

New employee logins created from the Workers screen receive a temporary mock password shown in the UI.

## Project Structure

```text
src/
  assets/         Logos and static visual assets
  components/     Shared UI, navigation, dashboard, and auth guard components
  contexts/       Global app state providers such as auth, i18n, and mock app data
  data/           Mock datasets used across the prototype
  hooks/          Custom React hooks for accessing app contexts
  i18n/           Locale dictionaries for the multilingual interface
  layouts/        Shared application shell layouts
  pages/          Route-level screens such as dashboard, login, chat, and settings
  App.jsx         Main route composition
  main.jsx        App bootstrap entry
```

## Notes

- The backend is not connected yet.
- Authentication is frontend/mock only in the current MVP.
- Mock passwords are stored in frontend data and are not production-safe.
- A production backend must hash passwords and manage sessions securely.
- Access control must be enforced server-side; frontend role guards are only a prototype convenience.
- `localStorage` persistence is only for frontend prototype/MVP state.
- Application data is local, resilient to empty/malformed storage, and based on mock datasets when no saved data exists.
- The project is intended as a strong frontend foundation for future production integration.

## Future Plans

- Connect a real backend
- Add persistent database storage
- Implement real authentication and session handling
- Support file uploads
- Integrate real maps and geolocation services
- Add AI-powered product and store search

## Development Status

BuildForU is currently positioned as a polished frontend prototype. The UI, routing, role-based flows, and mock operational data are in place, while production services such as backend APIs, authentication, storage, and external integrations are planned for the next phase.
