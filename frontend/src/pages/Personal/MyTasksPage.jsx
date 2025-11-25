import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiPlus, FiFilter, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { taskAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import toast from 'react-hot-toast';

/**
 * My Tasks Page - Personal Tasks
 */
const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks({});
      setTasks(response.data.data.tasks.filter(t => !t.groupId));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.createTask({ ...taskData, groupId: null });
      toast.success('Task created successfully!');
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await taskAPI.updateTask(editingTask._id, taskData);
      toast.success('Task updated successfully!');
      await fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirm) return;

    try {
      await taskAPI.deleteTask(deleteConfirm._id);
      toast.success('Task deleted');
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const prevTasks = [...tasks];
    
    // Optimistic update
    setTasks(tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t));

    try {
      await taskAPI.updateTask(task._id, { status: newStatus });
      toast.success(newStatus === 'DONE' ? 'Task completed!' : 'Task reopened');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      // Rollback
      setTasks(prevTasks);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'default',
      IN_PROGRESS: 'info',
      REVIEW: 'warning',
      DONE: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'default',
      MEDIUM: 'warning',
      HIGH: 'danger',
    };
    return colors[priority] || 'default';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal tasks
          </p>
        </div>
        <Button variant="primary" icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
          New Task
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2 mb-6">
        <FiFilter className="text-gray-400" />
        {['all', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiCheckSquare size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first task to get organized
            </p>
            <Button variant="primary" icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
              Create Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task._id} hover className="p-6 group relative">
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`p-2 rounded-lg ${
                    task.status === 'DONE'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  } transition-colors`}
                  title={task.status === 'DONE' ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit task"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(task)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete task"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1 pr-32">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    task.status === 'DONE'
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskModal
        isOpen={showCreateModal || !!editingTask}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        onSuccess={editingTask ? handleEditTask : handleCreateTask}
        groupId={null}
        task={editingTask}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default MyTasksPage;
