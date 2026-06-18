# Tradox — AI-Powered Trading & Portfolio Intelligence Platform

Tradox is an AI-powered stock prediction, market analysis, and portfolio intelligence platform. It features real-time social sentiment tracking, options strategy builders, portfolio stress testing under black swan scenarios, real-time paper trading simulation, and AI Trade Copilot assistance.

---

## Architecture Overview

Tradox is structured as a decoupled monorepo:
1. **Frontend**: Located in the root directory. Powered by **React 19**, **Vite**, **Tailwind CSS**, and **Framer Motion**.
2. **Backend**: Located in the `/server` directory. Powered by **Express.js**, **MongoDB**, **Socket.IO**, and **Vitest** for running unit/integration suites.

---

## Prerequisites

Before starting, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a remote connection string)

---

## Getting Started

### 1. Environment Configurations

#### Backend Environment Setup
Navigate to the `server` directory, copy the example environment file, and fill in the required keys:
```bash
cd server
cp .env.example .env
```

Ensure your `.env` contains:
- `PORT`: Server port (default: `8000`)
- `MONGODB_URI`: Connection string to MongoDB instance (e.g. `mongodb://localhost:27017/nexusai`)
- `JWT_SECRET`: Secret key for authentication tokens
- `GEMINI_API_KEY`: Google Gemini AI API key for AI Copilot (optional for offline mode)

#### Frontend Environment Setup
In the root directory, configure the API target if necessary. By default, the application is pre-configured to point to `http://localhost:8000`.

---

### 2. Backend Installation and Setup

Navigate to the backend directory, install the required node packages, and run the developer server:

```bash
cd server
npm install
npm run dev
```

*The backend server will run on `http://localhost:8000` with hot-reloading active.*

#### Running Backend Tests
To run unit and integration tests (such as ledger math and security validations):
```bash
npm run test
```

---

### 3. Frontend Installation and Setup

From the root directory of the project, install the dependencies and boot up the Vite dev server:

```bash
# Navigate to project root if you are in server/
cd .. 
npm install
npm run dev
```

*The frontend development server will spin up on `http://localhost:5173`.*

---

## Common Developer Operations

### Linters & Build Verifications
Before submitting pull requests or deploying, verify that there are no lints or build errors:

```bash
# Run lint check
npm run lint

# Compile production bundles
npm run build

# Preview production build locally
npm run preview
```

---

## Tech Stack Details

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Axios
- **Backend**: Node.js, Express.js, MongoDB, Socket.IO, Winston Logger
- **Testing**: Vitest (backend)
- **Deployment & Process Management**: Docker, PM2 (ecosystem configuration included)
