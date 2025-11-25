import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with default config
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * API utility functions
 */

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// User APIs
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getUserById: (userId) => api.get(`/users/${userId}`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
};

// Group APIs
export const groupAPI = {
  createGroup: (data) => api.post('/groups', data),
  getUserGroups: () => api.get('/groups'),
  getGroupById: (groupId) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId, data) => api.put(`/groups/${groupId}`, data),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  getGroupMembers: (groupId) => api.get(`/groups/${groupId}/members`),
  joinGroup: (inviteCode) => api.post('/groups/join', { inviteCode }),
  getJoinRequests: (groupId) => api.get(`/groups/${groupId}/join-requests`),
  processJoinRequest: (groupId, requestId, action) =>
    api.put(`/groups/${groupId}/join-requests/${requestId}`, { action }),
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
  updateMemberRole: (groupId, memberId, role) =>
    api.put(`/groups/${groupId}/members/${memberId}/role`, { role }),
  leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
  // Group Notes
  createNote: (groupId, data) => api.post(`/groups/${groupId}/notes`, data),
  getNotes: (groupId, params) => api.get(`/groups/${groupId}/notes`, { params }),
  updateNote: (groupId, noteId, data) => api.put(`/groups/${groupId}/notes/${noteId}`, data),
  deleteNote: (groupId, noteId) => api.delete(`/groups/${groupId}/notes/${noteId}`),
};

// Task APIs
export const taskAPI = {
  createTask: (data) => api.post('/tasks', data),
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  getTaskComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addTaskComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
};

// Resource APIs
export const resourceAPI = {
  createResource: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResources: (params) => api.get('/resources', { params }),
  deleteResource: (resourceId) => api.delete(`/resources/${resourceId}`),
};

// Event APIs
export const eventAPI = {
  createEvent: (data) => api.post('/events', data),
  getEvents: (params) => api.get('/events', { params }),
  updateEvent: (eventId, data) => api.put(`/events/${eventId}`, data),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
};

// Message APIs
export const messageAPI = {
  sendGroupMessage: (data) => api.post('/messages/group', data),
  getGroupMessages: (groupId, params) => api.get(`/messages/group/${groupId}`, { params }),
  sendDirectMessage: (data) => api.post('/messages/dm', data),
  getDirectMessages: (userId, params) => api.get(`/messages/dm/${userId}`, { params }),
  getConversations: () => api.get('/messages/conversations'),
  getUnreadCount: () => api.get('/messages/unread'),
};

// Personal APIs
export const personalAPI = {
  createNote: (data) => api.post('/personal/notes', data),
  getNotes: (params) => api.get('/personal/notes', { params }),
  updateNote: (noteId, data) => api.put(`/personal/notes/${noteId}`, data),
  deleteNote: (noteId) => api.delete(`/personal/notes/${noteId}`),
};
