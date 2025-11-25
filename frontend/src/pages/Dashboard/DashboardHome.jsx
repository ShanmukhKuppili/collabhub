import React, { useEffect, useState } from 'react';
import { FiUsers, FiCheckSquare, FiCalendar, FiPlus, FiUserPlus } from 'react-icons/fi';
import { groupAPI, taskAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import CreateGroupModal from '../../components/modals/CreateGroupModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Dashboard Home Page
 * Shows overview of groups, tasks, and recent activity
 */
const DashboardHome = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joiningGroup, setJoiningGroup] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [groupsRes, tasksRes] = await Promise.all([
        groupAPI.getUserGroups(),
        taskAPI.getTasks({}),
      ]);
      
      setGroups(groupsRes.data.data.groups);
      setTasks(tasksRes.data.data.tasks);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const getTaskStatusColor = (status) => {
    const colors = {
      TODO: 'default',
      IN_PROGRESS: 'info',
      REVIEW: 'warning',
      DONE: 'success',
    };
    return colors[status] || 'default';
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const res = await groupAPI.createGroup(groupData);
      toast.success('Group created successfully!');
      await fetchData();
      setShowCreateGroupModal(false);
      navigate(`/dashboard/groups/${res.data.data.group._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      throw error;
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setJoiningGroup(true);
    try {
      const res = await groupAPI.joinGroup(inviteCode.trim());
      toast.success(res.data.message || 'Successfully joined group!');
      await fetchData();
      setShowJoinGroupModal(false);
      setInviteCode('');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.message || 'Failed to join group');
    } finally {
      setJoiningGroup(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your workspace today
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">My Groups</p>
              <p className="text-3xl font-bold text-primary-900 dark:text-primary-100">{groups.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-200 dark:bg-primary-700 rounded-xl flex items-center justify-center">
              <FiUsers size={24} className="text-primary-700 dark:text-primary-200" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Active Tasks</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {tasks.filter(t => t.status !== 'DONE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-700 rounded-xl flex items-center justify-center">
              <FiCheckSquare size={24} className="text-green-700 dark:text-green-200" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Upcoming Events</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">0</p>
            </div>
            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-xl flex items-center justify-center">
              <FiCalendar size={24} className="text-purple-700 dark:text-purple-200" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Groups */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Groups</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={<FiUserPlus />}
              onClick={() => setShowJoinGroupModal(true)}
            >
              Join Group
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FiPlus />}
              onClick={() => setShowCreateGroupModal(true)}
            >
              New Group
            </Button>
          </div>
        </div>
        
        {groups.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiUsers size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No groups yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first group to start collaborating
              </p>
              <Button variant="primary" icon={<FiPlus />}>
                Create Group
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card
                key={group._id}
                hover
                onClick={() => navigate(`/dashboard/groups/${group._id}`)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar src={group.avatarUrl} name={group.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {group.description || 'No description'}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge size="sm" variant={group.type === 'public' ? 'success' : 'default'}>
                        {group.type}
                      </Badge>
                      <Badge size="sm" variant="primary">
                        {group.memberRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Tasks</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/my-tasks')}
          >
            View All
          </Button>
        </div>
        
        {tasks.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiCheckSquare size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first task to get started
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <Card key={task._id} hover>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge size="sm" variant={getTaskStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {task.priority && (
                        <Badge size="sm" variant={task.priority === 'HIGH' ? 'danger' : 'default'}>
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {task.assignees?.length > 0 && (
                    <div className="flex -space-x-2">
                      {task.assignees.slice(0, 3).map((assignee) => (
                        <Avatar
                          key={assignee._id}
                          src={assignee.avatarUrl}
                          name={assignee.name}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSuccess={handleCreateGroup}
      />

      {/* Join Group Modal */}
      <Modal
        isOpen={showJoinGroupModal}
        onClose={() => {
          setShowJoinGroupModal(false);
          setInviteCode('');
        }}
        title="Join Group"
      >
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the invite code provided by the group owner or admin
          </p>
          <Input
            label="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code (e.g., ABC123)"
            required
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowJoinGroupModal(false);
                setInviteCode('');
              }}
              disabled={joiningGroup}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={joiningGroup}>
              {joiningGroup ? 'Joining...' : 'Join Group'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardHome;
