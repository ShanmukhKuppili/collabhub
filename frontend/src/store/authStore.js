import { create } from 'zustand';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

/**
 * Auth store using Zustand
 * Manages authentication state and user data
 */
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Initialize auth from localStorage
   */
  initAuth: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
        
        // Initialize socket connection
        initSocket(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true });

      // Initialize socket connection
      initSocket(token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  /**
   * Register user
   */
  register: async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true });

      // Initialize socket connection
      initSocket(token);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();

    set({ user: null, token: null, isAuthenticated: false });
  },

  /**
   * Update user data
   */
  updateUser: (userData) => {
    set((state) => {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));

export default useAuthStore;
