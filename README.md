# C-SERP — Community Support and Emergency Response Platform

A full-stack web application for coordinating disaster response, connecting **Citizens**, **Volunteers**, and **Authorities** in real-time during emergencies.

## Features

### Citizen Dashboard
- Report emergency incidents with map-based location
- Report civic issues (potholes, power outages, drainage, etc.)
- Find nearby shelters, medical centres, and distribution points
- Track submitted reports and enrol as a victim

### Volunteer Dashboard
- View and apply for active emergency tasks
- Live field map with incident locations
- Check in/out of resource hubs
- Update task progress and status
- Personal profile with reliability score

### Authority Command Center
- Real-time overview dashboard with live statistics
- Manage disaster reports — review, assign volunteers, update status
- Volunteer matching engine
- Inventory and resource registry management
- Emergency broadcast system (push alerts by severity)
- Civic issue management
- Bulk user registration via CSV
- Complete activity logs and data export

### Cross-cutting
- **AI Chatbot** — Gemini-powered assistant for navigating the platform
- **Real-time updates** — Server-Sent Events (SSE) for live data
- **Interactive maps** — Leaflet with marker clustering
- **Multi-language** — Google Translate (English/Hindi)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, TailwindCSS v4, Zustand, React Router v7 |
| Backend | Node.js, Express, TypeScript (tsx) |
| Database | SQLite (better-sqlite3) |
| AI | Google Gemini 2.5 Flash |
| Maps | Leaflet + React-Leaflet + OpenStreetMap |
| Animations | Motion (Framer Motion) |
| Build | Vite 6 |

## Project Structure

```
├── server.ts              # Express server entry point (~60 lines)
├── database.ts            # SQLite schema & seed data
├── lib/
│   ├── auth.ts            # JWT middleware & config
│   └── helpers.ts         # Shared utilities (SSE, logging, ID generation)
├── routes/
│   ├── auth.ts            # Login, register, bulk-register
│   ├── reports.ts         # Disaster report CRUD + volunteer/victim actions
│   ├── inventory.ts       # Resource inventory CRUD
│   ├── broadcasts.ts      # Emergency broadcast CRUD
│   ├── civic.ts           # Civic issue CRUD
│   ├── locations.ts       # Location registry
│   ├── users.ts           # User management (authority)
│   ├── logs.ts            # Activity logs
│   ├── contributions.ts   # Donation/contribution tracking
│   └── notifications.ts   # SSE stream endpoint
├── frontend/src/
│   ├── App.tsx             # Main app with routing
│   ├── components/         # Shared UI components
│   ├── pages/
│   │   ├── auth/           # Login page
│   │   ├── citizen/        # Citizen dashboard pages
│   │   ├── volunteer/      # Volunteer dashboard pages
│   │   └── authority/      # Authority dashboard pages
│   ├── store/              # Zustand state management
│   └── hooks/              # Custom React hooks
├── src/App.tsx             # Root wrapper (imports frontend/src/App)
└── vite.config.ts          # Vite configuration
```

## Getting Started

### Prerequisites
- **Node.js** v18+ (LTS recommended)
- **npm** v9+

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd community-support-and-emergency-response-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your values:
   - `GEMINI_API_KEY` — Get from [Google AI Studio](https://aistudio.google.com/apikey)
   - `JWT_SECRET` — Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `ADMIN_SECRET` — Choose a strong secret for admin registration
   - `DEFAULT_ADMIN_PASSWORD` — Password for the seed admin account

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at **http://localhost:3000**

### Default Admin Account
- **Email:** `admin@cserp.gov`
- **Password:** Value of `DEFAULT_ADMIN_PASSWORD` in your `.env` (default: `Admin@2024`)

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | — | User login |
| POST | `/api/v1/auth/register` | — | User registration |
| POST | `/api/v1/auth/bulk-register` | Authority | CSV bulk user import |
| GET | `/api/v1/reports` | — | List all reports |
| POST | `/api/v1/reports` | Any | Create a report |
| PATCH | `/api/v1/reports/:id` | Vol/Auth | Update a report |
| DELETE | `/api/v1/reports/:id` | Authority | Delete a report |
| POST | `/api/v1/reports/:id/apply` | Any | Volunteer for a report |
| POST | `/api/v1/reports/:id/enroll-victim` | Any | Enrol as victim |
| GET | `/api/v1/broadcast` | — | List broadcasts |
| POST | `/api/v1/broadcast` | Authority | Send broadcast |
| GET | `/api/v1/civic-issues` | Any | List civic issues |
| POST | `/api/v1/civic-issues` | Any | Report civic issue |
| GET | `/api/v1/locations` | — | List locations |
| GET | `/api/v1/inventory` | — | List inventory |
| GET | `/api/v1/users` | Authority | List users |
| GET | `/api/v1/logs` | Authority | Activity logs |
| GET | `/api/v1/notifications/stream` | — | SSE stream |

## License

This project was built as a semester 6 mini project.
