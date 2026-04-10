# BuildForU

BuildForU is a construction company management web application focused on helping office teams and field crews stay aligned in one workspace. The current product is frontend-first and uses mock data, with separate experiences for Boss/Admin and Employee roles.

## Overview

BuildForU is designed as an internal operations platform for construction businesses. It provides role-based access to dashboards, workforce coordination tools, scheduling views, communication features, and market/store discovery. At this stage, the app is a frontend prototype that demonstrates product direction, UI structure, and user flows before backend integration.

## Main Features

- Role-based login flow for Boss/Admin and Employee users
- Admin dashboard for company-wide operations visibility
- Employee dashboard focused on personal assignments and field activity
- Workers management interface
- Calendar and schedule overview
- Task management
- Team chat
- Market map / store finder
- Multilingual UI
- Responsive design for desktop and mobile usage

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

## Example Mock Login Accounts

- `boss@buildforu.com`
- `worker@buildforu.com`

Any password works in the current prototype.

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

- The backend is not connected yet
- Authentication is currently mocked
- Application data is local and based on mock datasets
- The project is intended as a strong frontend foundation for future production integration

## Future Plans

- Connect a real backend
- Add persistent database storage
- Implement real authentication and session handling
- Support file uploads
- Integrate real maps and geolocation services
- Add AI-powered product and store search

## Development Status

BuildForU is currently positioned as a polished frontend prototype. The UI, routing, role-based flows, and mock operational data are in place, while production services such as backend APIs, authentication, storage, and external integrations are planned for the next phase.
