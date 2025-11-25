# CollabHub - Group Productivity & Collaboration Platform

A full-stack web application for team collaboration featuring group management, task tracking, real-time chat, file sharing, and more.

## 🚀 Features

### Backend (Complete ✅)
- **Authentication**: JWT-based auth with bcrypt password hashing
- **User Management**: Profile management, user search, presence tracking
- **Groups**: Create/join groups, roles (Owner/Admin/Moderator/Member), invite codes, join requests
- **Task Management**: Group and personal tasks with comments, assignments, status tracking
- **Resources**: File uploads, link sharing, note creation
- **Events**: Calendar events for groups
- **Messaging**: Real-time group chat, announcements, and direct messages via Socket.IO
- **Personal Workspace**: Personal tasks and notes

### Frontend (Core Complete ✅, Extended Features: Templates Provided)
- **Modern UI**: Built with React + Tailwind CSS, responsive design
- **Authentication Pages**: Beautiful login/register forms with validation
- **Dashboard Layout**: Collapsible sidebar, top navigation, user menu
- **Dashboard Home**: Overview with stats, groups, recent tasks
- **Reusable Components**: Button, Input, Modal, Card, Avatar, Badge, etc.
- **State Management**: Zustand for auth and UI state
- **Real-time**: Socket.IO client integration
- **API Integration**: Axios with interceptors

## 📁 Project Structure

```
CollabHub/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── socket/          # Socket.IO handlers
│   ├── uploads/         # File uploads directory
│   ├── .env             # Environment variables
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── common/  # Reusable UI components
    │   ├── layouts/     # Dashboard layout
    │   ├── pages/       # Page components
    │   │   ├── Auth/    # Login/Register
    │   │   ├── Dashboard/
    │   │   ├── Group/
    │   │   ├── Messages/
    │   │   └── Personal/
    │   ├── services/    # API & Socket.IO clients
    │   ├── store/       # Zustand stores
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css    # Tailwind styles
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created, update if needed):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collabhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🎨 What's Implemented

### Fully Functional:
- ✅ User registration and login
- ✅ JWT authentication
- ✅ All backend APIs (complete)
- ✅ Socket.IO real-time infrastructure
- ✅ Dashboard layout with navigation
- ✅ Group listing and basic navigation
- ✅ Responsive sidebar
- ✅ All reusable UI components

### Templates/Placeholders (Easy to Complete):
The following pages have placeholder implementations. The backend APIs are complete, you just need to:
1. Call the appropriate API from `services/api.js`
2. Use the provided UI components
3. Follow the patterns from `DashboardHome.jsx`

- **Group Page** (`/dashboard/groups/:groupId`):
  - Implement tabs: Tasks (Kanban), Chat, Resources, Events, Members
  - Use `groupAPI`, `taskAPI`, `messageAPI`, `resourceAPI`, `eventAPI`
  
- **Messages Page** (`/dashboard/messages`):
  - Conversation list (left panel)
  - Chat interface (right panel)
  - Real-time updates via Socket.IO
  - Use `messageAPI.getConversations()`, `messageAPI.getDirectMessages()`
  
- **My Tasks Page** (`/dashboard/my-tasks`):
  - Kanban board or list view
  - Task filters (status, priority)
  - Task detail modal
  - Use `taskAPI.getTasks({ groupId: null })`
  
- **My Notes Page** (`/dashboard/my-notes`):
  - Note cards grid
  - Create/edit note modal
  - Tag filtering
  - Use `personalAPI.getNotes()`, `personalAPI.createNote()`

## 📝 Key Implementation Patterns

### Making API Calls
```javascript
import { groupAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fetchGroups = async () => {
  try {
    const response = await groupAPI.getUserGroups();
    setGroups(response.data.data.groups);
  } catch (error) {
    toast.error('Failed to load groups');
  }
};
```

### Using Socket.IO
```javascript
import { getSocket, onSocketEvent, offSocketEvent } from '../../services/socket';

useEffect(() => {
  const socket = getSocket();
  
  const handleNewMessage = (message) => {
    // Handle real-time message
  };
  
  onSocketEvent('message:new', handleNewMessage);
  
  return () => {
    offSocketEvent('message:new', handleNewMessage);
  };
}, []);
```

### Creating Modals
```javascript
import Modal from '../../components/common/Modal';
import useUIStore from '../../store/uiStore';

const { modals, openModal, closeModal } = useUIStore();

<Modal
  isOpen={modals.createGroup}
  onClose={() => closeModal('createGroup')}
  title="Create Group"
>
  {/* Form content */}
</Modal>
```

## 🎯 Next Steps to Complete the App

1. **Group Page Tabs**: Create TabPanel component and implement each tab
2. **Task Kanban Board**: Use drag-and-drop (react-beautiful-dnd or manual)
3. **Chat Interface**: Message bubbles, real-time updates, typing indicators
4. **Resource Upload**: File upload with progress, preview, download
5. **Calendar View**: Events display (can use a library or simple list)
6. **Modals**: Create group, task, event, note, resource modals
7. **Member Management**: Add/remove members, change roles
8. **Notifications**: Toast notifications for real-time events

## 🚀 Tech Stack

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)
- Socket.IO Client
- React Hot Toast
- React Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT + Bcrypt
- Multer (file uploads)

## 📚 API Documentation

All APIs are in `backend/routes/` and `backend/controllers/`. Key endpoints:

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout

### Groups
- POST `/api/groups` - Create group
- GET `/api/groups` - Get user's groups
- POST `/api/groups/join` - Join via invite code
- GET `/api/groups/:groupId/members` - Get members
- More: see `backend/routes/group.routes.js`

### Tasks
- POST `/api/tasks` - Create task
- GET `/api/tasks?groupId=xxx` - Get tasks
- PUT `/api/tasks/:taskId` - Update task
- POST `/api/tasks/:taskId/comments` - Add comment

### Messages
- POST `/api/messages/group` - Send group message
- POST `/api/messages/dm` - Send DM
- GET `/api/messages/conversations` - Get DM list
- Socket events: `message:new`, `message:dm`, `typing:start`, etc.

## 💡 Tips

- Follow the patterns in `DashboardHome.jsx` for data fetching
- Use the provided UI components for consistency
- All forms should have validation and loading states
- Use toast notifications for user feedback
- Socket.IO events are already set up in `socket/socketHandler.js`
- Mobile responsiveness is built into components

## 🐛 Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

**CORS errors:**
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check both servers are running

**Socket.IO not connecting:**
- Check `REACT_APP_SOCKET_URL` in frontend `.env`
- Ensure token is being passed in Socket.IO auth

## 📄 License

MIT License - Feel free to use for learning and projects!

---

**Happy Coding! 🎉**

This is a solid foundation. The backend is production-ready and the frontend has all the infrastructure. Just fill in the placeholders with beautiful UI using the components and patterns provided!
