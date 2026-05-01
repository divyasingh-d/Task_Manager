# TeamTask — MERN Team Task Management App

A full-stack collaborative task management application built with MongoDB, Express, React, and Node.js. Supports JWT authentication, role-based access control, project management, and a real-time dashboard.

---

## Features

- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **Projects** — Create projects; creator becomes admin automatically
- **Role-Based Access** — Admins manage all tasks & members; members update only assigned tasks
- **Kanban Board** — Tasks organized in To Do / In Progress / Done columns
- **Dashboard** — Stats: total tasks, by status, per user, overdue alerts
- **Member Management** — Add/remove project members by email
- **Dark UI** — Polished dark theme with Tailwind CSS

---

## Project Structure

```
teamtask/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   ├── projectAccess.js   # Member/admin role checks
│   │   └── validate.js        # express-validator helper
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── server.js
│   ├── .env.example
│   └── railway.toml
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/
        │   ├── axios.js       # Axios instance with auth interceptors
        │   └── services.js    # All API call functions
        ├── components/
        │   ├── Layout.jsx
        │   ├── Modal.jsx
        │   ├── StatCard.jsx
        │   ├── TaskCard.jsx
        │   ├── CreateTaskModal.jsx
        │   ├── CreateProjectModal.jsx
        │   └── AddMemberModal.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useProjects.js
        │   └── useTasks.js
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProjectPage.jsx
        │   └── TaskPage.jsx
        ├── utils/
        │   └── helpers.js
        ├── App.jsx
        ├── index.js
        └── index.css
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/yourname/teamtask.git
cd teamtask
```

### 2. Backend setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/teamtask
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Start the backend dev server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd ../frontend
npm install

# Optional: only needed if you're not using the CRA proxy
cp .env.example .env.local
```

Start the React dev server:

```bash
npm start
```

The app will be running at `http://localhost:3000`.

---

## API Reference

### Auth

| Method | Endpoint          | Description        | Auth |
|--------|-------------------|--------------------|------|
| POST   | /api/auth/signup  | Register new user  | ❌   |
| POST   | /api/auth/login   | Login, get JWT     | ❌   |
| GET    | /api/auth/me      | Get current user   | ✅   |

### Projects

| Method | Endpoint                                    | Description           | Role    |
|--------|---------------------------------------------|-----------------------|---------|
| GET    | /api/projects                               | List my projects      | Member+ |
| POST   | /api/projects                               | Create project        | Any     |
| GET    | /api/projects/:id                           | Get project detail    | Member+ |
| PUT    | /api/projects/:id                           | Update project        | Admin   |
| DELETE | /api/projects/:id                           | Delete project        | Admin   |
| POST   | /api/projects/:id/members                   | Add member by email   | Admin   |
| DELETE | /api/projects/:id/members/:userId           | Remove member         | Admin   |
| PUT    | /api/projects/:id/members/:userId/role      | Change member role    | Admin   |

### Tasks

| Method | Endpoint                         | Description            | Role          |
|--------|----------------------------------|------------------------|---------------|
| GET    | /api/tasks/project/:projectId    | Get project tasks      | Member+       |
| GET    | /api/tasks/:taskId               | Get single task        | Member+       |
| POST   | /api/tasks/project/:projectId    | Create task            | Admin         |
| PUT    | /api/tasks/:taskId               | Update task            | Admin/Assignee|
| DELETE | /api/tasks/:taskId               | Delete task            | Admin         |

### Dashboard

| Method | Endpoint        | Description              | Auth |
|--------|-----------------|--------------------------|------|
| GET    | /api/dashboard  | Get aggregated stats     | ✅   |

---

## Deployment

### Backend → Railway

1. Push your code to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select `teamtask/backend` as the root directory.
4. Add these environment variables in the Railway dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your Vercel/Netlify frontend URL)
   - `NODE_ENV=production`
5. Railway auto-detects Node.js and deploys using `npm start`.

### Frontend → Vercel (recommended)

```bash
cd frontend
npm run build
```

1. Push to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the frontend folder.
3. Set environment variable:
   - `REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api`
4. Deploy.

### Frontend → Netlify

```bash
cd frontend
npm run build
```

Drag and drop the `build/` folder to [netlify.com/drop](https://app.netlify.com/drop), or:

```bash
npx netlify-cli deploy --prod --dir=build
```

Set `REACT_APP_API_URL` in Netlify's environment variables.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable    | Description                        | Example                              |
|-------------|------------------------------------|--------------------------------------|
| PORT        | Server port                        | 5000                                 |
| MONGO_URI   | MongoDB connection string          | mongodb+srv://...                    |
| JWT_SECRET  | Secret for signing JWTs            | a_long_random_string                 |
| NODE_ENV    | Environment                        | development / production             |
| CLIENT_URL  | Frontend origin for CORS           | http://localhost:3000                |

### Frontend (`frontend/.env.local`)

| Variable              | Description                   | Example                                        |
|-----------------------|-------------------------------|------------------------------------------------|
| REACT_APP_API_URL     | Backend API base URL          | https://teamtask.up.railway.app/api           |

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Tailwind CSS, Axios |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs                      |
| Validation | express-validator                   |
| UI Extras  | react-hot-toast, lucide-react, date-fns |
| Deploy     | Railway (API), Vercel (Frontend)    |

---

## Role Permissions Summary

| Action                | Admin | Member |
|-----------------------|-------|--------|
| View all tasks        | ✅    | ❌ (own only) |
| Create tasks          | ✅    | ❌     |
| Update any task       | ✅    | ❌     |
| Update assigned task status | ✅ | ✅  |
| Delete tasks          | ✅    | ❌     |
| Add/remove members    | ✅    | ❌     |
| Delete project        | ✅    | ❌     |

---


