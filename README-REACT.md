# KLU Arena — React + Vite foundation

This branch adds a React/Vite application alongside the existing static website. Existing HTML pages and Firebase scripts are intentionally preserved.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

## Modules

- Public landing page with tournament and announcement listings.
- User registration, login, profile and dashboard.
- Admin dashboard with user activation controls, tournament creation and announcements.
- LocalStorage persistence for demo accounts, sessions and content.

## Demo admin setup

Set `VITE_ADMIN_EMAILS` in `.env` to a comma-separated list of admin email addresses **before registering those accounts**. A matching address receives the admin role on registration. Do not treat this client-side check as secure authorization.

## Important security and data notes

This is a front-end demonstration foundation, not a production identity system:
- LocalStorage can be inspected and modified by the person using the browser. Client-side admin roles and account status can be tampered with.
- Passwords are SHA-256 hashed in the browser as a basic demo measure; this is not a substitute for a server-side password hashing/authentication service.
- LocalStorage data is device- and browser-specific and is not shared between users or devices.
- Do not store sensitive personal information or real credentials in this demo.
- Production deployment should use Firebase Authentication (already present in the legacy project) or another identity provider, plus server-enforced authorization and database security rules.

## Existing site

The existing root-level HTML/CSS/JS pages are not removed. This React app currently runs as the Vite app entry point from `frontend/`.
