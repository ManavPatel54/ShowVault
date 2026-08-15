# Event Booking Engine — Frontend (Phase F1)

A React + Vite frontend for the Event Booking Engine platform.

---

## Project Phase

**Phase F1 — Frontend Foundation**

This phase establishes the React application structure, routing, global styles,
and placeholder pages. No backend integration is active yet.

---

## Tech Stack

| Technology      | Purpose                         |
|-----------------|---------------------------------|
| React 18        | UI library                      |
| Vite 5          | Development server & bundler    |
| React Router 6  | Client-side routing             |
| Axios           | HTTP client (pre-configured)    |
| Plain CSS       | Styling (no UI framework)       |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install dependencies

```bash
cd client
npm install
```

### Start the development server

```bash
npm run dev
```

The app will start at: **http://localhost:3000**

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable        | Description                  | Default                        |
|-----------------|------------------------------|--------------------------------|
| `VITE_API_URL`  | Backend API base URL         | `http://localhost:5000/api`    |

> Vite only exposes variables prefixed with `VITE_` to the browser bundle.

---

## Routes

| URL          | Page       | Description                    |
|--------------|------------|--------------------------------|
| `/`          | Home       | Landing page                   |
| `/login`     | Login      | Sign-in form (visual only)     |
| `/register`  | Register   | Sign-up form (visual only)     |
| `/dashboard` | Dashboard  | Placeholder dashboard          |

---

## Folder Structure

```
client/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       ← Reusable navigation bar
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Home.jsx         ← Landing page
│   │   ├── Home.css
│   │   ├── Login.jsx        ← Login form (visual)
│   │   ├── Register.jsx     ← Register form (visual)
│   │   ├── Auth.css         ← Shared auth page styles
│   │   ├── Dashboard.jsx    ← Dashboard placeholder
│   │   └── Dashboard.css
│   ├── services/
│   │   └── api.js           ← Axios pre-configured instance
│   ├── context/             ← (empty — AuthContext coming later)
│   ├── hooks/               ← (empty — custom hooks coming later)
│   ├── App.jsx              ← Root component + route definitions
│   ├── main.jsx             ← React entry point
│   └── index.css            ← Global design system & CSS tokens
├── .env                     ← Local env (not committed)
├── .env.example             ← Env template (committed)
├── index.html               ← HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## Available Scripts

| Command           | Description                      |
|-------------------|----------------------------------|
| `npm run dev`     | Start Vite dev server on :3000   |
| `npm run build`   | Build production bundle          |
| `npm run preview` | Preview production build         |

---

## URLs to Test

After running `npm run dev`:

| Route        | URL                                  |
|--------------|--------------------------------------|
| Home         | http://localhost:3000/               |
| Login        | http://localhost:3000/login          |
| Register     | http://localhost:3000/register       |
| Dashboard    | http://localhost:3000/dashboard      |

---

## Backend

The backend Express server runs separately on **http://localhost:5000**.

Start the backend from the `server/` directory:

```bash
cd server
npm run dev
```

---

## Upcoming Phases

- **Phase F2** — AuthContext, JWT handling, login/register API integration
- **Phase F3** — Protected routes, events listing, seat booking
- **Phase F4** — Payments, real-time seat updates (Socket.io)
