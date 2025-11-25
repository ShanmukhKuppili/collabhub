# CollabHub Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Option 1: Automated Setup (Recommended)

#### On Linux/Mac:
```bash
chmod +x setup.sh
./setup.sh
```

#### On Windows:
```bash
setup.bat
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
# Make sure .env file exists (it's already created)
npm run dev
```

Backend runs on: `http://localhost:5000`

#### 2. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

#### 3. MongoDB
Make sure MongoDB is running:
```bash
mongod
```

Or use MongoDB Atlas (cloud) - just update `MONGODB_URI` in `backend/.env`

---

## 🎯 First Steps After Setup

1. **Open browser**: http://localhost:3000
2. **Register** a new account
3. **Login** with your credentials
4. **Create a group** from the dashboard
5. **Invite others** using the group invite code

---

## 📁 Project Structure Overview

```
CollabHub/
├── backend/          # Express + MongoDB + Socket.IO
│   ├── models/       # 10 Mongoose schemas (User, Group, Task, etc.)
│   ├── routes/       # 8 route files (auth, groups, tasks, etc.)
│   ├── controllers/  # Business logic
│   ├── socket/       # Real-time Socket.IO handlers
│   └── server.js     # Main server file
│
└── frontend/         # React + Tailwind CSS
    ├── components/   # Reusable UI components
    ├── pages/        # Page components
    ├── services/     # API & Socket.IO clients
    ├── store/        # Zustand state management
    └── layouts/      # Dashboard layout
```

---

## ✅ What's Working Out of the Box

### Backend (100% Complete)
- ✅ User authentication (register, login, JWT)
- ✅ Group management (create, join, roles, invites)
- ✅ Task management (CRUD, comments, assignments)
- ✅ Real-time messaging (groups, DMs, Socket.IO)
- ✅ File uploads (multer)
- ✅ Events & Calendar
- ✅ Personal notes
- ✅ User presence tracking

### Frontend (Core Complete)
- ✅ Beautiful auth pages (login/register)
- ✅ Dashboard with sidebar navigation
- ✅ Group listing and overview
- ✅ Modern UI components (buttons, modals, cards, etc.)
- ✅ Responsive design
- ✅ API integration
- ✅ Socket.IO client setup
- ✅ State management

### Placeholder Pages (Easy to Complete)
- 📝 Group detail page with tabs (backend APIs ready)
- 📝 Chat interface (Socket.IO infrastructure ready)
- 📝 Task Kanban board (task APIs ready)
- 📝 Personal workspace pages

---

## 🎨 Building Additional Features

All the hard work is done! To add features:

### Example: Adding Group Chat

1. **Use existing Socket.IO setup**:
```javascript
import { getSocket, onSocketEvent } from '../services/socket';
```

2. **Call message APIs**:
```javascript
import { messageAPI } from '../services/api';
const messages = await messageAPI.getGroupMessages(groupId);
```

3. **Use UI components**:
```javascript
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
```

### Example: Creating a Task

```javascript
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';

const createTask = async (taskData) => {
  try {
    const response = await taskAPI.createTask(taskData);
    toast.success('Task created!');
    // Refresh task list
  } catch (error) {
    toast.error('Failed to create task');
  }
};
```

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabhub
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🐛 Common Issues

**Issue: MongoDB connection error**
- Solution: Make sure MongoDB is running (`mongod`)
- Or use MongoDB Atlas and update `MONGODB_URI`

**Issue: CORS errors**
- Solution: Check `FRONTEND_URL` in backend `.env` matches your frontend URL

**Issue: Socket.IO not connecting**
- Solution: Verify both backend and frontend are running
- Check browser console for errors

**Issue: npm install fails**
- Solution: Delete `node_modules` and `package-lock.json`, run `npm install` again
- Make sure you have Node.js v16 or higher

---

## 📚 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `POST /api/groups/join` - Join group with invite code
- `GET /api/groups/:groupId` - Get group details
- `GET /api/groups/:groupId/members` - Get members

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks?groupId=xxx` - Get tasks
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/:taskId/comments` - Add comment

### Messages
- `POST /api/messages/group` - Send group message
- `POST /api/messages/dm` - Send direct message
- `GET /api/messages/conversations` - Get DM conversations
- `GET /api/messages/group/:groupId` - Get group messages

*See `README.md` for complete API documentation*

---

## 🎯 Recommended Next Steps

1. **Complete Group Page**: Add tabs for tasks, chat, resources
2. **Build Chat Interface**: Use `messageAPI` and Socket.IO events
3. **Create Task Kanban**: Use drag-and-drop or simple status columns
4. **Add Modals**: Group creation, task creation, etc.
5. **Implement Notifications**: Real-time toast notifications

---

## 💡 Tips for Development

1. **Follow Existing Patterns**: Look at `DashboardHome.jsx` for API usage examples
2. **Use Provided Components**: Button, Modal, Card, etc. are production-ready
3. **Check Backend First**: All APIs are documented and working
4. **Test with Multiple Users**: Open in incognito for multi-user testing
5. **Check Console**: Both browser and terminal for errors/logs

---

## 🚀 Deployment

### Backend
- Deploy to: Heroku, Railway, DigitalOcean, AWS
- Use: MongoDB Atlas for database
- Set: Production environment variables

### Frontend
- Deploy to: Vercel, Netlify, GitHub Pages
- Update: API URLs to production backend
- Build: `npm run build`

---

## 📞 Need Help?

Check:
1. Backend logs in terminal
2. Browser console for frontend errors
3. MongoDB connection status
4. Environment variables are correct

---

**You're all set! Start coding and build something amazing! 🎉**

The foundation is solid, the backend is complete, and the frontend infrastructure is ready. Just fill in the templates with beautiful UI using the provided components!
