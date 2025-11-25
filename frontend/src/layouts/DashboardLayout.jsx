import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiMessageSquare, FiCheckSquare, 
  FiFileText, FiMenu, FiX, FiBell, FiSettings, FiLogOut,
  FiSearch, FiPlus
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { groupAPI } from '../services/api';
import Avatar from '../components/common/Avatar';
import ThemeToggle from '../components/common/ThemeToggle';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import toast from 'react-hot-toast';

/**
 * Dashboard Layout with Sidebar and Top Navigation
 */
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    try {
      const response = await groupAPI.getUserGroups();
      setGroups(response.data.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };
  
  const handleCreateGroup = async (groupData) => {
    try {
      const response = await groupAPI.createGroup(groupData);
      toast.success('Group created successfully!');
      
      // Refresh groups list
      await fetchGroups();
      
      // Navigate to the new group
      const newGroup = response.data.data.group;
      navigate(`/dashboard/groups/${newGroup._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.response?.data?.message || 'Failed to create group');
      throw error;
    }
  };
  
  const navigation = [
    { name: 'Home', path: '/dashboard', icon: FiHome },
    { name: 'Messages', path: '/dashboard/messages', icon: FiMessageSquare },
    { name: 'My Tasks', path: '/dashboard/my-tasks', icon: FiCheckSquare },
    { name: 'My Notes', path: '/dashboard/my-notes', icon: FiFileText },
  ];
  
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">CollabHub</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            {sidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          ))}
          
          {/* Groups Section */}
          {!sidebarCollapsed && (
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Groups
                </h3>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Create Group"
                  onClick={() => setShowCreateGroupModal(true)}
                >
                  <FiPlus size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-1">
                {loadingGroups ? (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                ) : groups.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No groups yet</p>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group._id}
                      onClick={() => navigate(`/dashboard/groups/${group._id}`)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname.includes(group._id)
                          ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Avatar src={group.avatarUrl} name={group.name} size="sm" />
                      <span className="font-medium text-sm truncate flex-1 text-left">
                        {group.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.name}
                size="md"
                status={user?.status}
              />
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              )}
            </button>
            
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                >
                  <FiSettings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu size={24} />
            </button>
            
            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FiBell size={20} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {/* User Avatar (mobile) */}
            <button className="md:hidden">
              <Avatar
                src={user?.avatarUrl}
                name={user?.name}
                size="sm"
                status={user?.status}
              />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800">
            {/* Same sidebar content as desktop */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">CollabHub</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>
            {/* Add mobile navigation here */}
          </div>
        </div>
      )}
      
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSuccess={handleCreateGroup}
      />
    </div>
  );
};

export default DashboardLayout;
