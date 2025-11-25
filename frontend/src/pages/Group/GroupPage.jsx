import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FiCheckSquare, FiMessageSquare, FiFile, FiCalendar, 
  FiUsers, FiPlus, FiEdit2, FiTrash2, FiCheck, FiFileText 
} from 'react-icons/fi';
import { groupAPI, taskAPI, messageAPI, resourceAPI, eventAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import CreateNoteModal from '../../components/modals/CreateNoteModal';
import CreateResourceModal from '../../components/modals/CreateResourceModal';
import CreateEventModal from '../../components/modals/CreateEventModal';
import toast from 'react-hot-toast';

/**
 * Group Page with Tabs
 */
const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, tasksRes, notesRes] = await Promise.all([
        groupAPI.getGroupById(groupId),
        taskAPI.getTasks({ groupId }),
        groupAPI.getNotes(groupId),
      ]);
      
      setGroup(groupRes.data.data.group);
      setTasks(tasksRes.data.data.tasks);
      setNotes(notesRes.data.data.notes);
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.createTask(taskData);
      toast.success('Task created successfully!');
      await fetchGroupData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
      throw error;
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Optimistic update
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task');
      // Rollback on error
      setTasks(prevTasks);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await taskAPI.updateTask(editingTask._id, taskData);
      toast.success('Task updated successfully!');
      await fetchGroupData();
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
      await fetchGroupData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await handleUpdateTaskStatus(task._id, newStatus);
  };

  // Note handlers
  const handleCreateNote = async (noteData) => {
    try {
      await groupAPI.createNote(groupId, noteData);
      toast.success('Note created successfully!');
      await fetchGroupData();
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      throw error;
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await groupAPI.updateNote(groupId, editingNote._id, noteData);
      toast.success('Note updated successfully!');
      await fetchGroupData();
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'note') return;

    try {
      await groupAPI.deleteNote(groupId, deleteConfirm._id);
      toast.success('Note deleted');
      await fetchGroupData();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
    { id: 'notes', label: 'Notes', icon: FiFileText },
    { id: 'chat', label: 'Chat', icon: FiMessageSquare },
    { id: 'resources', label: 'Resources', icon: FiFile },
    { id: 'events', label: 'Events', icon: FiCalendar },
    { id: 'members', label: 'Members', icon: FiUsers },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-8">
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-400">Group not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar src={group.avatarUrl} name={group.name} size="xl" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={group.type === 'public' ? 'success' : 'default'}>
                  {group.type}
                </Badge>
                {group.memberRole && (
                  <Badge variant="primary">{group.memberRole}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-8">
          {activeTab === 'tasks' && (
            <TasksTab 
              tasks={tasks} 
              groupId={groupId}
              onRefresh={fetchGroupData}
              onCreateTask={() => setShowCreateTaskModal(true)}
              onEditTask={(task) => setEditingTask(task)}
              onDeleteTask={(task) => setDeleteConfirm(task)}
              onToggleComplete={handleToggleComplete}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              getTasksByStatus={getTasksByStatus}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          )}
          {activeTab === 'notes' && (
            <NotesTab 
              notes={notes}
              groupId={groupId}
              onCreateNote={() => setShowCreateNoteModal(true)}
              onEditNote={(note) => setEditingNote(note)}
              onDeleteNote={(note) => setDeleteConfirm({ ...note, type: 'note' })}
            />
          )}
          {activeTab === 'chat' && <ChatTab groupId={groupId} />}
          {activeTab === 'resources' && <ResourcesTab groupId={groupId} />}
          {activeTab === 'events' && <EventsTab groupId={groupId} />}
          {activeTab === 'members' && <MembersTab groupId={groupId} />}
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal || !!editingTask}
        onClose={() => {
          setShowCreateTaskModal(false);
          setEditingTask(null);
        }}
        onSuccess={editingTask ? handleEditTask : handleCreateTask}
        groupId={groupId}
        task={editingTask}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteConfirm?.type === 'note' ? handleDeleteNote : handleDeleteTask}
        title={deleteConfirm?.type === 'note' ? 'Delete Note' : 'Delete Task'}
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Create/Edit Note Modal */}
      <CreateNoteModal
        isOpen={showCreateNoteModal || !!editingNote}
        onClose={() => {
          setShowCreateNoteModal(false);
          setEditingNote(null);
        }}
        onSuccess={editingNote ? handleEditNote : handleCreateNote}
        groupId={groupId}
        note={editingNote}
      />
    </div>
  );
};

// Tasks Tab Component
const TasksTab = ({ tasks, groupId, onRefresh, onCreateTask, onEditTask, onDeleteTask, onToggleComplete, onUpdateTaskStatus, getTasksByStatus, getStatusColor, getPriorityColor }) => {
  const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onUpdateTaskStatus(draggedTask._id, newStatus);
    }
    setDraggedTask(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={onCreateTask}>
          New Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statuses.map((status) => {
          const statusTasks = getTasksByStatus(status);
          return (
            <div 
              key={status} 
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[300px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {status.replace('_', ' ')}
                </h3>
                <Badge variant={getStatusColor(status)} size="sm">
                  {statusTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {statusTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Drop tasks here
                  </p>
                ) : (
                  statusTasks.map((task) => (
                    <Card 
                      key={task._id} 
                      className="p-4 group relative hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      {/* Action buttons - hidden until hover */}
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task);
                          }}
                          className={`p-1.5 rounded ${
                            task.status === 'DONE'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          } transition-colors`}
                          title={task.status === 'DONE' ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit task"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task);
                          }}
                          className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete task"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      <h4 className={`font-medium mb-2 pr-24 ${
                        task.status === 'DONE' 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                        {task.assignees?.length > 0 && (
                          <div className="flex -space-x-2">
                            {task.assignees.slice(0, 3).map((assignee) => (
                              <Avatar
                                key={assignee._id}
                                src={assignee.avatarUrl}
                                name={assignee.name}
                                size="xs"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Notes Tab Component
const NotesTab = ({ notes, groupId, onCreateNote, onEditNote, onDeleteNote }) => {
  const COLOR_CLASSES = {
    default: 'bg-white dark:bg-gray-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notes</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={onCreateNote}>
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiFileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first note to share with the group
            </p>
            <Button variant="primary" icon={<FiPlus />} onClick={onCreateNote}>
              Create Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow group ${
                COLOR_CLASSES[note.color] || COLOR_CLASSES.default
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 mr-2">
                  {note.title}
                </h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditNote(note)}
                    className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit note"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note)}
                    className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              {note.content && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-6 whitespace-pre-wrap">
                  {note.content}
                </p>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.map((tag, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  {note.createdBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {note.createdBy.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Chat Tab Component
const ChatTab = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = React.useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleNewMessage = React.useCallback((message) => {
    if (message.groupId === groupId) {
      setMessages(prev => [...prev, message]);
    }
  }, [groupId]);

  const fetchMessages = React.useCallback(async () => {
    try {
      const res = await messageAPI.getGroupMessages(groupId, { limit: 100 });
      setMessages(res.data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMessages();
    
    // Get socket and listen for new messages
    const socket = window.socketInstance;
    if (socket) {
      // Join the group room
      socket.emit('group:join', groupId);
      
      // Listen for messages
      socket.on('group_message', handleNewMessage);
      
      return () => {
        socket.off('group_message', handleNewMessage);
        // Leave the group room
        socket.emit('group:leave', groupId);
      };
    }
  }, [groupId, handleNewMessage, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const socket = window.socketInstance;
      if (socket) {
        socket.emit('send_group_message', {
          groupId,
          content: newMessage.trim(),
          channelType: 'GROUP',
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
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
    <Card className="h-[600px] flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageSquare size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId._id === currentUser._id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar 
                    src={msg.senderId.avatarUrl} 
                    name={msg.senderId.name} 
                    size="sm" 
                  />
                  <div>
                    {!isOwn && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {msg.senderId.name}
                      </p>
                    )}
                    <div className={`rounded-lg px-4 py-2 ${
                      isOwn 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={sending}
          />
          <Button type="submit" variant="primary" disabled={!newMessage.trim() || sending}>
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Resources Tab Component
const ResourcesTab = ({ groupId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [groupId, filter, selectedTag]);

  const fetchResources = async () => {
    try {
      const params = { groupId };
      if (filter !== 'ALL') params.type = filter;
      if (selectedTag) params.tag = selectedTag;
      
      const res = await resourceAPI.getResources(params);
      setResources(res.data.data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from resources
  const allTags = [...new Set(resources.flatMap(r => r.tags || []))].sort();

  const handleCreateResource = async (data) => {
    try {
      await resourceAPI.createResource({ ...data, groupId });
      toast.success('Resource created successfully!');
      await fetchResources();
      setShowCreateModal(false);
      setCreateType(null);
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
      throw error;
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await resourceAPI.deleteResource(resourceId);
      toast.success('Resource deleted');
      await fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'LINK':
        return <FiFile className="text-blue-600 dark:text-blue-400" />;
      case 'FILE':
        return <FiFile className="text-green-600 dark:text-green-400" />;
      case 'NOTE':
        return <FiFileText className="text-purple-600 dark:text-purple-400" />;
      default:
        return <FiFile />;
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resources</h2>
          <div className="flex space-x-1">
            {['ALL', 'FILE', 'LINK', 'NOTE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => { setCreateType('LINK'); setShowCreateModal(true); }}>
            Add Link
          </Button>
          <Button variant="outline" onClick={() => { setCreateType('FILE'); setShowCreateModal(true); }}>
            Upload File
          </Button>
          <Button variant="primary" onClick={() => { setCreateType('NOTE'); setShowCreateModal(true); }}>
            New Note
          </Button>
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedTag
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {resources.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiFile size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No resources yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share files, links, and notes with your group
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Card key={resource._id} className="p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getResourceIcon(resource.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {resource.title}
                    </h3>
                    <Badge variant="default" size="sm">{resource.type}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteResource(resource._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              {resource.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* Tags Display */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.map((tag, i) => (
                    <Badge key={i} variant="default" size="sm" className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Open Link →
                </a>
              )}

              {resource.filePath && (
                <a
                  href={`http://localhost:5000/${resource.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Download File →
                </a>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{resource.createdBy?.name}</span>
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Resource Modal */}
      {showCreateModal && (
        <CreateResourceModal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); setCreateType(null); }}
          onSuccess={handleCreateResource}
          type={createType}
        />
      )}
    </div>
  );
};

// Events Tab Component
const EventsTab = ({ groupId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [groupId]);

  const fetchEvents = async () => {
    try {
      const res = await eventAPI.getEvents({ groupId });
      setEvents(res.data.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (data) => {
    try {
      await eventAPI.createEvent({ ...data, groupId });
      toast.success('Event created successfully!');
      await fetchEvents();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  };

  const handleUpdateEvent = async (data) => {
    try {
      await eventAPI.updateEvent(editingEvent._id, data);
      toast.success('Event updated successfully!');
      await fetchEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventAPI.deleteEvent(eventId);
      toast.success('Event deleted');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Events</h2>
        <Button variant="primary" icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
          New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiCalendar size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Schedule meetings and events for your group
            </p>
            <Button variant="primary" icon={<FiPlus />} onClick={() => setShowCreateModal(true)}>
              Create Event
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            const isPast = endDate < new Date();
            
            return (
              <Card key={event._id} className={`p-6 ${isPast ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4 flex-1">
                    <div className="text-center bg-primary-50 dark:bg-primary-900/30 rounded-lg p-3 min-w-[80px]">
                      <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                        {startDate.getDate()}
                      </div>
                      <div className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {startDate.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          🕒 {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {event.location && (
                          <span>📍 {event.location}</span>
                        )}
                        <span>👤 {event.createdBy?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {(showCreateModal || editingEvent) && (
        <CreateEventModal
          isOpen={showCreateModal || !!editingEvent}
          onClose={() => { setShowCreateModal(false); setEditingEvent(null); }}
          onSuccess={editingEvent ? handleUpdateEvent : handleCreateEvent}
          event={editingEvent}
        />
      )}
    </div>
  );
};

// Members Tab Component
const MembersTab = ({ groupId }) => {
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('members');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [groupData, setGroupData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [membersRes, groupRes] = await Promise.all([
        groupAPI.getGroupMembers(groupId),
        groupAPI.getGroupById(groupId),
      ]);
      
      setMembers(membersRes.data.data.members);
      setGroupData(groupRes.data.data.group);

      // Fetch join requests if user is admin
      if (['OWNER', 'ADMIN'].includes(groupRes.data.data.group.memberRole)) {
        try {
          const requestsRes = await groupAPI.getJoinRequests(groupId);
          setJoinRequests(requestsRes.data.data.requests);
        } catch (error) {
          console.error('Error fetching join requests:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await groupAPI.processJoinRequest(groupId, requestId, 'approve');
      toast.success('Request approved');
      await fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await groupAPI.processJoinRequest(groupId, requestId, 'reject');
      toast.success('Request rejected');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await groupAPI.removeMember(groupId, memberId);
      toast.success('Member removed');
      await fetchData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await groupAPI.updateMemberRole(groupId, memberId, newRole);
      toast.success('Role updated');
      await fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'OWNER': return 'danger';
      case 'ADMIN': return 'warning';
      case 'MODERATOR': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const isAdmin = ['OWNER', 'ADMIN'].includes(groupData?.memberRole);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Members</h2>
          {isAdmin && (
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveSubTab('members')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSubTab === 'members'
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveSubTab('requests')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSubTab === 'requests'
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Requests ({joinRequests.length})
              </button>
            </div>
          )}
        </div>
        {groupData?.inviteCode && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Invite Code:</span>
            <code className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono font-semibold">
              {groupData.inviteCode}
            </code>
          </div>
        )}
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar 
                    src={member.userId.avatarUrl} 
                    name={member.userId.name} 
                    size="md" 
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {member.userId.name}
                      {member.userId._id === currentUser._id && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(You)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.userId.email}
                    </p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </div>

                {isAdmin && member.role !== 'OWNER' && member.userId._id !== currentUser._id && (
                  <div className="flex items-center space-x-2">
                    {groupData.memberRole === 'OWNER' && (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.userId._id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.userId._id)}
                      className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeSubTab === 'requests' && isAdmin && (
        <div className="space-y-3">
          {joinRequests.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No pending join requests
                </p>
              </div>
            </Card>
          ) : (
            joinRequests.map((request) => (
              <Card key={request._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar 
                      src={request.userId.avatarUrl} 
                      name={request.userId.name} 
                      size="md" 
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {request.userId.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.userId.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="success"
                      size="sm"
                      icon={<FiCheck />}
                      onClick={() => handleApproveRequest(request._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GroupPage;
