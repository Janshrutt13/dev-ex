<div align="center">
  <h1>Dev-Ex 🚀</h1>
  <p>A full-stack code logging platform for developers to build discipline, track progress, and find collaborators.</p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  </p>
</div>

## About

Dev-Ex is a platform built for developers who want to stay consistent. Whether you're taking on a 75-day or 100-day coding challenge or just want to log your daily work, Dev-Ex helps you maintain your streak. It also features a dedicated section for finding project collaborators, where only verfied Github profiles can create or join collabs.

## ✨ Core Features

- **Daily Code Logging**: Share your daily progress, tasks, and learnings in a public, minimalistic feed
- **Coding Challenges**: Commit to a 75 or 100-day challenge and let the app help you track your streak
- **Streak Tracking**: A custom-built streak calculation engine motivates you to log your progress every day
- **Collaboration Hub**: Post your project ideas or find existing projects to join
- **Open Collaboration**: All registered users can post and join collaboration projects
- **Secure Authentication**: Full authentication flow with JWT (email/password) and OAuth 2.0 (GitHub)
- **Modern UI/UX**: A sleek, collapsible sidebar layout built with shadcn/ui and Tailwind CSS
- **Dark & Light Mode**: Seamless theme switching based on your system preference or manual toggle

## 💻 Tech Stack

| Area | Technology | Purpose |
|------|------------|---------|
| **Frontend** | Next.js 14 (React) | App Router, Server/Client Components, UI |
| | TypeScript | Type-safe code |
| | shadcn/ui | Component library for the sleek UI |
| | Tailwind CSS | Utility-first styling |
| | Framer Motion | UI animations |
| **Backend** | Node.js | JavaScript runtime |
| | Express.js | API server framework |
| | MongoDB | NoSQL database |
| | Mongoose | Object Data Modeling (ODM) for MongoDB |
| **Authentication** | JWT (jsonwebtoken) | Standard email/password sessions |
| | Passport.js (GitHub) | OAuth 2.0 for GitHub login |
| | bcrypt.js | Password hashing |
| **Containerization** | Docker & Docker Compose | Consistent development & production environment |

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/dev-ex.git
cd dev-ex
```

### 2. Set Up Environment Variables

This project uses a single `.env` file in the root directory, which is loaded by Docker Compose and injected into the services.

Create the `.env` file by copying the example:

```bash
cp .env.example .env
```

Open the new `.env` file and fill in the required variables:

```env
# Node.js Backend
PORT=5000
MONGO_URI=mongodb://mongo:27017/dev-ex
JWT_SECRET=YOUR_SUPER_SECRET_RANDOM_STRING_HERE

# GitHub OAuth
GITHUB_CLIENT_ID=YOUR_GITHUB_OAUTH_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_OAUTH_CLIENT_SECRET

# URLs
FRONTEND_URL=http://localhost:3000
```

### 3. Get GitHub OAuth Credentials

To enable GitHub login, you must register a new OAuth App on GitHub:

1. Go to **Settings > Developer settings > OAuth Apps > New OAuth App**
2. Set the **Application name** to `Dev-Ex (Local)`
3. Set the **Homepage URL** to `http://localhost:3000`
4. Set the **Authorization callback URL** to `http://localhost:5000/api/auth/github/callback`
5. Click **Register application**
6. Generate a **New client secret**
7. Copy the **Client ID** and **Client Secret** into your `.env` file

### 4. Build and Run with Docker

With Docker Desktop running, execute the following command from the project's root directory:

```bash
docker-compose up --build
```

> **Note**: `--build` forces Docker to rebuild your images. Use this the first time or after changing dependencies.

Your application will start in foreground mode, showing you live logs from all services.

To run in the background (detached mode), use:

```bash
docker-compose up -d
```

### 5. Access Your Application

Your full-stack application is now running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📂 Project Structure

The project uses a monorepo-style structure with separate frontend and backend directories, all managed by a root `docker-compose.yml`.

```
dev-ex/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Handles request logic (auth, log, collab)
│   │   ├── models/        # Mongoose DB schemas (user, log, collab)
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Auth middleware (protect)
│   │   ├── config/        # Passport.js strategy
│   │   └── index.js       # Main Express server
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/        # Auth pages (login, signup)
│   │   │   └── (main)/        # App pages with sidebar layout
│   │   │       ├── feed/
│   │   │       ├── collab/
│   │   │       └── layout.tsx   # Main sidebar layout
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── collab-post.tsx
│   │   │   └── sidebar.tsx    # Collapsible sidebar
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   └── globals.css
│   ├── Dockerfile
│   └── package.json
│
├── .env                  # (Git-ignored) Your local secrets
├── .env.example          # Template for environment variables
├── docker-compose.yml    # Defines and runs all services
└── README.md             # This file
```

## 🔐 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| **Auth** |
| POST | `/api/auth/signup` | Public | Register a new user with email/password |
| POST | `/api/auth/login` | Public | Log in a user and receive a JWT |
| GET | `/api/auth/github` | Public | Initiate GitHub OAuth login |
| GET | `/api/auth/github/callback` | Public | GitHub callback to finalize OAuth |
| **Users** |
| GET | `/api/users/me` | Private | Get the profile of the currently logged-in user |
| **Logs** |
| GET | `/api/logs` | Public | Get all log posts for the main feed |
| POST | `/api/logs` | Private | Create a new log post and update streak |
| **Collabs** |
| GET | `/api/collabs` | Public | Get all "OPEN" collaboration projects |
| POST | `/api/collabs` | Private | Create a new project |
| PATCH | `/api/collabs/:id/join` | Private | Join an open collaboration project |

## 🗺️ Future Roadmap

- **GitHub-Style Streak Calendar**: A visual calendar on user profiles showing their logging consistency
- **Email Reminders**: A node-cron job to send daily emails to users to maintain their streak
- **Full Profile Pages**: Viewable user profiles showing their logs, projects, and streak
- **In-App Messaging**: Allow collaborators to chat directly

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.
