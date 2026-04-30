# 📋 TaskFlow — Team Task Manager

## 🌐 Live URL
taskmanager-production-0734.up.railway.app

## 🎯 Features
- JWT Authentication with Role-based Access (Admin/Member)
- Project creation & team management
- Task assignment with priority & due dates
- Kanban board (Todo / In Progress / Done)
- Dashboard with overdue task tracking

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Deployment:** Railway

## ⚙️ Setup Locally
1. Clone the repo
   git clone https://github.com/Zabir03/TaskManager
2. Install dependencies
   cd backend && npm install
3. Create .env file in backend/
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=task_manager
   JWT_SECRET=yoursecretkey
   PORT=5000
4. Run MySQL schema from schema.sql
5. Start server
   npm run dev
6. Open frontend/index.html in browser

## 📡 API Endpoints
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| GET | /api/projects | Auth |
| POST | /api/projects | Admin |
| DELETE | /api/projects/:id | Admin |
| GET | /api/tasks/dashboard | Auth |
| GET | /api/tasks/project/:id | Auth |
| POST | /api/tasks | Auth |
| PATCH | /api/tasks/:id/status | Auth |
| DELETE | /api/tasks/:id | Admin |

## 👤 Test Credentials
Admin  → admin@test.com / password123
Member → member@test.com / password123