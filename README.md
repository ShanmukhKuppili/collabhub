# 🚀 CollabHub

> A modern, real-time collaboration platform for teams to chat, manage tasks, share resources, and stay organized.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

## ✨ Features

- 🔥 **Real-time Group Chat** with Socket.IO
- ✅ **Task Management** with priorities and deadlines
- 📁 **Resource Sharing** - Files, links, and notes with tags
- 📅 **Event Calendar** for team scheduling
- 💬 **Direct Messaging** between team members
- 👥 **Group Management** with invite codes and approval workflow
- 🎨 **Dark/Light/System Theme** with persistence
- 📱 **Responsive Design** for all devices
- 🔒 **Secure Authentication** with JWT
- ⚙️ **Full Settings** - Profile, password, notifications

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Socket.IO, JWT, bcrypt  
**Frontend:** React 18, Tailwind CSS, Zustand, Axios, Socket.IO Client

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/collabhub.git
cd collabhub

# Run setup script (installs dependencies)
./setup.sh  # Linux/Mac
# OR
setup.bat   # Windows

# Configure backend environment
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend (Terminal 1)
npm start

# Start frontend (Terminal 2)
cd ../frontend
npm start
```

Visit **http://localhost:3000** and sign up!

## 📖 Usage

1. **Sign up** or log in
2. **Create a group** or join with invite code
3. **Chat** in real-time with your team
4. **Create tasks** and assign to members
5. **Share resources** with tags for organization
6. **Schedule events** on the calendar
7. **Customize** your profile and preferences in Settings

## 📁 Project Structure

```
collabhub/
├── backend/          # Node.js + Express API
│   ├── models/       # Mongoose schemas
│   ├── controllers/  # Route handlers
│   ├── routes/       # API endpoints
│   ├── socket/       # Socket.IO handlers
│   └── server.js     # Entry point
│
├── frontend/         # React application
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page components
│       ├── services/    # API & Socket.IO
│       └── store/       # State management
│
└── README.md
```

## 🔒 Security

- JWT authentication with secure token storage
- Password hashing with bcrypt
- Protected API routes with middleware
- Input validation on all endpoints

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📝 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using modern web technologies**
