# Copilot instructions for Job-Matching

## Project overview

This repo is a full-stack job-matching platform with a React frontend and an Express/MySQL backend.

- Frontend app: `frontend/` (Vite + React)
- Backend app: `backend/` (Express, MySQL, JWT, Google OAuth, OTP email flow)
- Shared app concept: users sign up, verify identity with OTP, choose a role, upload CVs, and match against job requirements using a skill-matching score

The fastest way to understand the app is to read these in order:

1. `frontend/src/App.jsx` for page routing and protected-role checks
2. `frontend/src/context/AuthContext.jsx` for auth state and token persistence
3. `frontend/src/services/api.js` for the shared API client and auth headers
4. `backend/server.js` for the bootstrap, middleware, upload setup, JWT auth helper, and match-score logic
5. `backend/routes/auth.js` and `backend/routes/jobRoutes.js` for the actual API behavior

## Build, lint, and local run commands

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

For a focused lint check on one file:

```bash
cd frontend
npx eslint src/path/to/file.jsx
```

### Backend

```bash
cd backend
npm install
node server.js
```

For live reload during backend development:

```bash
cd backend
npx nodemon server.js
```

### Test status

There is no repository-wide automated test suite configured for this project. The backend `npm test` script is currently a placeholder that exits with an error, and there are no Vitest/Jest/Mocha specs in the codebase. Use ESLint as the main validation path for frontend changes, and run the app locally to verify behavior.

## High-level architecture

### Frontend structure

`frontend/src` is organized around a role-based app shell:

- `App.jsx` defines routes for public pages, auth flows, seeker screens, employer screens, and admin screens
- `components/` holds reusable screens and UI blocks such as `Navbar`, `Profile`, `OtpVerification`, and role selection views
- `pages/` contains route-level pages like `Home`, `MatchResults`, `SeekerDashboard`, and `EmployerDashboard`
- `context/AuthContext.jsx` stores the user and token in `localStorage` and exposes login/logout state to the app
- `services/api.js` centralizes Axios config and injects the `Authorization: Bearer <token>` header for authenticated requests

The frontend does not use a separate state store; it relies on the app shell and localStorage-backed auth state instead.

### Backend structure

`backend/server.js` is the main bootstrap file and contains a large amount of app behavior:

- CORS and Express middleware setup
- Passport initialization and Google OAuth support
- JWT helper middleware for protected routes
- Multer CV upload configuration and `uploads/cvs` handling
- OTP creation and email sending via Nodemailer
- Job matching logic and route wiring

`backend/routes/` splits API work into domain modules:

- `auth.js` handles Google login, OTP verification/resend, and role assignment
- `jobRoutes.js` contains the match scoring and applicant endpoints
- Additional route files may be added in the same pattern

`backend/connection.js` and `backend/config/db.js` configure the MySQL connection; the app expects a running MySQL instance with a database such as `job_matching` and credentials supplied through environment variables.

### Data and app domain

This app is a recruitment platform with the following flow:

- User signs up or logs in via Google or email OTP
- Role is chosen (job seeker / employer / admin)
- Seekers upload CVs and provide profile data
- Employers post or review jobs
- A skill overlap algorithm computes a match score between a seeker profile and a job requirement
- Applications are stored in MySQL so employer dashboards can rank applicants by match score

## Key conventions and repo-specific patterns

- This repo uses a split frontend/backend layout, not a single app root. Changes often require edits in both `frontend/` and `backend/` when adding or changing a feature.
- Protected routes are centralized in `frontend/src/App.jsx` using `ProtectedRoute` and `allowedRoles`; if a new page needs auth, do not bypass the route guard.
- Authentication tokens are persisted in `localStorage` and read in `AuthContext` and `api.js`; keep both patterns aligned when changing token behavior.
- The app uses environment variables heavily. On the backend, expect values such as `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `SESSION_SECRET`, and `CLIENT_URL`; on the frontend, the API base URL is typically `VITE_API_URL`.
- CV files are treated as uploads, not just form data. Files are stored under `backend/uploads/cvs` and served from `/uploads`, and file type/size restrictions are enforced in `backend/server.js`.
- The match-rate logic is duplicated in both `backend/server.js` and `backend/routes/jobRoutes.js`; if the score logic changes, keep both implementations consistent.
- Role names are not normalized to one canonical value. Existing route guards accept multiple aliases such as `job_seeker`, `seeker`, `jobseeker`, `user`, and `employee`; preserve the current compatibility pattern when updating auth flows.
- The repo includes mixed-language comments and some older/inconsistent naming (for example, `employee` vs `seeker` route aliases). Keep changes compatible with the existing routing conventions instead of “cleaning up” unrelated naming unless the task specifically requires it.

## Working in this repo

- Prefer changing the smallest relevant backend route or frontend page instead of introducing a new architectural pattern.
- When a task spans auth, routing, and API behavior, inspect both the frontend `App.jsx` route and the backend route module together.
- If you need to add or change a protected page, update the route guard and keep the role aliases consistent with the current checks.
- For backend API work, keep `server.js` and the relevant route file in sync; this project often keeps route logic and app bootstrap together.
