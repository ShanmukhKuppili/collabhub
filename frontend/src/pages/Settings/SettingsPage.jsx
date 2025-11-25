import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiMoon, FiBell, FiSave, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';

/**
 * Settings Page - User profile, account, appearance, and notification settings
 */
const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    bio: '',
    status: 'online',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    notifyOnGroupMessage: true,
    notifyOnTaskAssignment: true,
    notifyOnEventReminder: true,
  });

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const user = response.data.data.user;
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl || '',
          bio: user.bio || '',
          status: user.status || 'online',
        });
        setNotificationSettings(user.notificationSettings || {
          notifyOnGroupMessage: true,
          notifyOnTaskAssignment: true,
          notifyOnEventReminder: true,
        });
        // Sync theme from backend if it exists
        if (user.theme && ['light', 'dark', 'system'].includes(user.theme)) {
          setTheme(user.theme);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (newTheme) => {
    // Update theme via context (will also save to localStorage)
    setTheme(newTheme);
  };

  const saveProfile = async () => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/me`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const savePassword = async () => {
    // Validate passwords
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaveLoading(false);
    }
  };

  const saveAppearance = async () => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/me`,
        { theme: theme },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Appearance settings saved');
      }
    } catch (error) {
      console.error('Error saving appearance:', error);
      toast.error('Failed to save appearance settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const saveNotifications = async () => {
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/me`,
        { notificationSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Notification settings saved');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'account', label: 'Account', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: FiMoon },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Section Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Right Content - Section Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update your personal information and profile details
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="John Doe"
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="john@example.com"
                    disabled
                    helperText="Email cannot be changed"
                  />

                  <Input
                    label="Avatar URL"
                    name="avatarUrl"
                    value={profileData.avatarUrl}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/avatar.jpg"
                  />

                  <Textarea
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />

                  <Select
                    label="Status"
                    name="status"
                    value={profileData.status}
                    onChange={handleProfileChange}
                    options={[
                      { value: 'online', label: 'Online' },
                      { value: 'away', label: 'Away' },
                      { value: 'busy', label: 'Busy' },
                      { value: 'offline', label: 'Offline' },
                    ]}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    onClick={saveProfile}
                    loading={saveLoading}
                    disabled={saveLoading}
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your account security</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>

                  <Input
                    label="Current Password"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />

                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    helperText="Must be at least 6 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    onClick={savePassword}
                    loading={saveLoading}
                    disabled={saveLoading}
                  >
                    <FiLock className="mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appearance</h2>
                  <p className="text-gray-600 dark:text-gray-400">Customize how CollabHub looks</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['light', 'dark', 'system'].map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => handleThemeChange(themeOption)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === themeOption
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                            {themeOption}
                          </span>
                          {theme === themeOption && (
                            <FiCheck className="text-primary-600 dark:text-primary-400" size={20} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          {themeOption === 'light' && 'Light mode'}
                          {themeOption === 'dark' && 'Dark mode'}
                          {themeOption === 'system' && 'Follow system'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    onClick={saveAppearance}
                    loading={saveLoading}
                    disabled={saveLoading}
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage how you receive notifications
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Toggle for Group Messages */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Group Messages</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when someone sends a message in your groups
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notifyOnGroupMessage}
                        onChange={() => handleNotificationToggle('notifyOnGroupMessage')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Toggle for Task Assignment */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Task Assignment</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when you are assigned to a task
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notifyOnTaskAssignment}
                        onChange={() => handleNotificationToggle('notifyOnTaskAssignment')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Toggle for Event Reminders */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Event Reminders</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about upcoming events
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.notifyOnEventReminder}
                        onChange={() => handleNotificationToggle('notifyOnEventReminder')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    onClick={saveNotifications}
                    loading={saveLoading}
                    disabled={saveLoading}
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
