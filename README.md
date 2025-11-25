# 🚀 CollabHub

> A modern, full-stack collaboration platform for teams to communicate, manage tasks, share resources, and stay organized in real-time.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black.svg)](https://socket.io/)

![CollabHub Banner](https://via.placeholder.com/800x200/6366f1/ffffff?text=CollabHub+-+Team+Collaboration+Platform)

## ✨ Features

### 🎯 Core Features
- 🔥 **Real-time Group Chat** - Instant messaging with Socket.IO, persistent message history
- ✅ **Task Management** - Create, assign, and track tasks with priorities, deadlines, and status updates
- 📁 **Resource Sharing** - Upload files (up to 50MB), share links, and create notes with searchable tags
- 📅 **Event Calendar** - Schedule team events with datetime management
- 💬 **Direct Messaging** - One-on-one private conversations
- 👥 **Group Management** - Create groups with invite codes, manage members, and handle join requests
- 📝 **Personal Workspace** - Private notes and task lists for individual productivity

### 🎨 UI/UX Features
- 🌓 **Dark/Light/System Theme** - Full theme support with automatic system detection
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🎭 **Modern Auth Pages** - Beautiful split-layout login/signup screens with gradient designs
- ⚙️ **Comprehensive Settings** - Profile management, password change, appearance, and notification preferences
- 🎯 **Intuitive Navigation** - Collapsible sidebar, breadcrumbs, and quick access menus

### 🔐 Security Features
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🔑 **Password Security** - bcrypt hashing with salt rounds
- 🛡️ **Protected Routes** - Middleware-based API protection
- ✅ **Input Validation** - Server-side validation on all endpoints

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time:** Socket.IO
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt for password hashing
- **File Upload:** multer (50MB limit)

### Frontend
- **Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios with interceptors
- **Real-time:** Socket.IO Client
- **Routing:** React Router v6
- **Notifications:** React Hot Toast
- **Icons:** React Icons (Feather Icons)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **MongoDB** 6.x or higher (running locally or MongoDB Atlas)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/collabhub.git
cd collabhub
```

2. **Install dependencies**

**Option A: Automated Setup (Recommended)**
```bash
# Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

**Option B: Manual Setup**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collabhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

> **Note:** Make sure MongoDB is running before starting the backend.

4. **Start the application**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App opens automatically on http://localhost:3000
```

5. **Access the application**

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

### First Steps
1. Click **"Sign Up"** to create a new account
2. Fill in your name, email, and password
3. After registration, you'll be automatically logged in
4. Create your first group or join existing ones with an invite code
5. Start collaborating!

## 📖 Usage Guide

### Creating and Managing Groups
1. Click **"New Group"** on the dashboard
2. Enter group name and description
3. Share the **invite code** with team members
4. Manage members and roles from the group settings

### Task Management
1. Navigate to **"My Tasks"** for personal tasks or group task tabs
2. Click **"New Task"** to create a task
3. Set **priority** (Low, Medium, High, Critical)
4. Assign to team members
5. Set deadlines and track status
6. Add comments for collaboration

### Resource Sharing
1. Go to a group's **"Resources"** tab
2. Choose resource type:
   - **Upload File:** Up to 50MB (documents, images, etc.)
   - **Share Link:** External URLs
   - **Create Note:** Rich text notes
3. Add **tags** for easy filtering and search
4. Click on tags to filter resources by category

### Real-time Chat
1. Open a group and navigate to the **"Chat"** tab
2. Type messages in the input field
3. Messages are delivered instantly to all online members
4. All messages are saved to the database for history

### Event Calendar
1. Go to the **"Events"** tab in a group
2. Click **"New Event"** 
3. Set event name, description, date, and time
4. Team members can view upcoming events
5. Past events are visually distinguished

### Personal Workspace
- **My Notes:** Create private notes for yourself
- **My Tasks:** Manage personal tasks separate from groups

### Settings & Customization
1. Click your avatar → **"Settings"**
2. **Profile:** Update name, avatar, bio, and status
3. **Account:** Change your password securely
4. **Appearance:** Choose Light, Dark, or System theme
5. **Notifications:** Control notification preferences

## 📁 Project Structure

```
collabhub/
├── backend/                    # Node.js + Express backend
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── auth.controller.js
│   │   ├── group.controller.js
│   │   ├── task.controller.js
│   │   ├── message.controller.js
│   │   ├── resource.controller.js
│   │   ├── event.controller.js
│   │   ├── user.controller.js
│   │   └── personal.controller.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Task.js
│   │   ├── Message.js
│   │   ├── Resource.js
│   │   ├── Event.js
│   │   └── ...
│   ├── routes/                # API endpoints
│   │   ├── auth.routes.js
│   │   ├── group.routes.js
│   │   ├── task.routes.js
│   │   └── ...
│   ├── socket/
│   │   └── socketHandler.js   # Socket.IO logic
│   ├── uploads/               # File uploads directory
│   ├── .env.example           # Environment template
│   ├── server.js              # Express app entry point
│   └── package.json
│
├── frontend/                  # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── ...
│   │   │   └── modals/
│   │   │       ├── CreateGroupModal.jsx
│   │   │       ├── CreateTaskModal.jsx
│   │   │       └── ...
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardHome.jsx
│   │   │   ├── Group/
│   │   │   │   └── GroupPage.jsx
│   │   │   ├── Messages/
│   │   │   │   └── MessagesPage.jsx
│   │   │   ├── Personal/
│   │   │   │   ├── MyTasksPage.jsx
│   │   │   │   └── MyNotesPage.jsx
│   │   │   └── Settings/
│   │   │       └── SettingsPage.jsx
│   │   ├── services/
│   │   │   ├── api.js         # Axios instance
│   │   │   └── socket.js      # Socket.IO client
│   │   ├── store/
│   │   │   ├── authStore.js   # Zustand auth state
│   │   │   └── uiStore.js     # UI state
│   │   ├── App.jsx            # Main app component
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json
│
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
├── FEATURES.md                # Detailed features
├── PROJECT_SUMMARY.md         # Project overview
├── QUICKSTART.md              # Quick start guide
├── setup.sh                   # Linux/Mac setup
└── setup.bat                  # Windows setup
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile/settings
- `POST /api/users/change-password` - Change password
- `GET /api/users/search` - Search users

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Join with invite code
- `POST /api/groups/:id/approve/:userId` - Approve join request

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment

### Resources
- `GET /api/resources` - Get group resources
- `POST /api/resources` - Create resource (file/link/note)
- `DELETE /api/resources/:id` - Delete resource

### Events
- `GET /api/events` - Get group events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Messages
- `GET /api/messages/group/:groupId` - Get group messages
- `POST /api/messages/group/:groupId` - Send group message
- `GET /api/messages/dm/:userId` - Get direct messages
- `POST /api/messages/dm/:userId` - Send direct message

### Socket.IO Events
- `connection` - Client connects
- `group:join` - Join group room
- `group:leave` - Leave group room
- `send_group_message` - Send message to group
- `send_dm` - Send direct message
- `new_group_message` - Receive group message
- `new_dm` - Receive direct message

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens:** Secure token-based authentication with configurable expiration
- **Password Hashing:** bcrypt with 10 salt rounds
- **Protected Routes:** Middleware-based API protection on all sensitive endpoints
- **Session Management:** Token stored in localStorage with automatic expiry

### Data Protection
- **Input Validation:** Server-side validation on all user inputs
- **SQL Injection Prevention:** Mongoose parameterized queries
- **XSS Protection:** React's built-in XSS protection
- **File Upload Security:** File type and size validation (50MB limit)

### Best Practices
- Environment variables for sensitive configuration
- CORS configuration for controlled access
- Password strength requirements (minimum 6 characters)
- Secure password change with old password verification

## 🚧 Troubleshooting

### MongoDB Connection Issues
```bash
# Ensure MongoDB is running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear npm cache and reinstall
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### Socket.IO Connection Issues
- Check that backend is running before frontend
- Verify CORS settings in `backend/server.js`
- Check browser console for connection errors

## 🎯 Roadmap

- [ ] **Email Notifications** - Send email alerts for important events
- [ ] **File Preview** - In-app preview for images and documents
- [ ] **Video Calls** - WebRTC integration for video conferencing
- [ ] **Mobile App** - React Native mobile application
- [ ] **Advanced Search** - Full-text search across all content
- [ ] **Analytics Dashboard** - Team productivity insights
- [ ] **Integrations** - Third-party app integrations (Slack, GitHub, etc.)
- [ ] **Calendar Sync** - Google Calendar / Outlook integration
- [ ] **Two-Factor Auth** - Enhanced security with 2FA

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

## 👨‍💻 Author

**Shanmukh Kuppili**
- GitHub: [@shanmukh-kuppili](https://github.com/shanmukh-kuppili)
- Email: your.email@example.com

## 🙏 Acknowledgments

- **MongoDB** - For the excellent NoSQL database
- **Socket.IO** - For real-time bidirectional communication
- **React Team** - For the amazing UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Feather Icons** - For the beautiful icon set
- All open-source contributors whose libraries made this project possible

## 📞 Support

Need help? Have questions?

- 📧 **Email:** your.email@example.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/collabhub/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/collabhub/discussions)

## 🌟 Show Your Support

If you like this project, please consider:
- ⭐ Giving it a star on GitHub
- 🍴 Forking it for your own projects
- 📢 Sharing it with your network
- 🐛 Reporting bugs or suggesting features

---

<div align="center">

**Built with ❤️ using modern web technologies**

Made by developers, for developers

[⬆ Back to Top](#-collabhub)

</div>
