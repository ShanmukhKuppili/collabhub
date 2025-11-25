import { create } from 'zustand';

/**
 * UI store for managing modals, sidebars, and UI state
 */
const useUIStore = create((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // Mobile menu state
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  
  // Modal states
  modals: {
    createGroup: false,
    createTask: false,
    createEvent: false,
    createResource: false,
    createNote: false,
    taskDetail: false,
    groupSettings: false,
    userProfile: false,
  },
  
  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),
  
  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),
  
  closeAllModals: () =>
    set({
      modals: {
        createGroup: false,
        createTask: false,
        createEvent: false,
        createResource: false,
        createNote: false,
        taskDetail: false,
        groupSettings: false,
        userProfile: false,
      },
    }),
  
  // Selected items
  selectedGroup: null,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  selectedConversation: null,
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  
  // Loading states
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useUIStore;
