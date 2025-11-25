import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiSend, FiSearch, FiMoreVertical, FiUsers, FiUser, FiX, FiPlus } from 'react-icons/fi';
import { messageAPI, groupAPI, userAPI } from '../../services/api';
import { getSocket, joinGroupRoom, leaveGroupRoom, onSocketEvent, offSocketEvent } from '../../services/socket';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

/**
 * Messages Page - Real-time Chat
 */
const MessagesPage = () => {
  const { userId: dmUserId } = useParams();
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
      if (activeConversation.type === 'group') {
        joinGroupRoom(activeConversation._id);
      }
    }

    return () => {
      if (activeConversation?.type === 'group') {
        leaveGroupRoom(activeConversation._id);
      }
    };
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;

    onSocketEvent('message:new', handleNewMessage);
    onSocketEvent('message:dm', handleNewDM);
    onSocketEvent('group_message', handleNewMessage);
    onSocketEvent('dm_message', handleNewDM);
  };

  const cleanupSocketListeners = () => {
    offSocketEvent('message:new', handleNewMessage);
    offSocketEvent('message:dm', handleNewDM);
    offSocketEvent('group_message', handleNewMessage);
    offSocketEvent('dm_message', handleNewDM);
  };

  const handleNewMessage = (message) => {
    if (activeConversation?.type === 'group' && message.groupId === activeConversation._id) {
      setMessages(prev => {
        // Avoid duplicates - check by _id or by content+time
        const isDuplicate = prev.some(m => 
          m._id === message._id || 
          (m.content === message.content && 
           m.senderId?._id === message.senderId?._id && 
           Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
        );
        
        if (isDuplicate) {
          // Replace temp message with real one
          return prev.map(m => m._id?.toString().startsWith('temp-') && m.content === message.content ? message : m);
        }
        
        return [...prev, message];
      });
    }
    // Update conversation's last message
    setConversations(prev => prev.map(conv => {
      if (conv.type === 'group' && conv._id === message.groupId) {
        return { ...conv, lastMessage: message };
      }
      return conv;
    }));
  };

  const handleNewDM = (message) => {
    const otherUserId = message.senderId._id === user._id ? message.receiverId._id : message.senderId._id;
    
    if (activeConversation?.type === 'dm' && activeConversation._id === otherUserId) {
      setMessages(prev => {
        // Avoid duplicates
        const isDuplicate = prev.some(m => 
          m._id === message._id || 
          (m.content === message.content && 
           m.senderId?._id === message.senderId?._id && 
           Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
        );
        
        if (isDuplicate) {
          // Replace temp message with real one
          return prev.map(m => m._id?.toString().startsWith('temp-') && m.content === message.content ? message : m);
        }
        
        return [...prev, message];
      });
    }
    
    // Update conversation's last message or add new conversation
    setConversations(prev => {
      const existingConv = prev.find(c => c.type === 'dm' && c._id === otherUserId);
      if (existingConv) {
        return prev.map(conv => {
          if (conv.type === 'dm' && conv._id === otherUserId) {
            return { ...conv, lastMessage: message };
          }
          return conv;
        }).sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt || 0;
          const bTime = b.lastMessage?.createdAt || b.createdAt || 0;
          return new Date(bTime) - new Date(aTime);
        });
      } else {
        // Add new conversation
        const otherUser = message.senderId._id === user._id ? message.receiverId : message.senderId;
        const newConv = {
          _id: otherUser._id,
          type: 'dm',
          name: otherUser.name,
          avatar: otherUser.avatarUrl,
          status: otherUser.status,
          lastMessage: message,
        };
        return [newConv, ...prev];
      }
    });
  };

  const fetchConversations = async () => {
    try {
      // Fetch groups
      const groupsRes = await groupAPI.getUserGroups();
      const groupConvos = groupsRes.data.data.groups.map(group => ({
        ...group,
        type: 'group',
        name: group.name,
        avatar: group.avatarUrl,
      }));

      // Fetch DM conversations
      const dmsRes = await messageAPI.getConversations();
      const dmConvos = dmsRes.data.data.conversations.map(conv => ({
        _id: conv.user._id,
        type: 'dm',
        name: conv.user.name,
        avatar: conv.user.avatarUrl,
        status: conv.user.status,
        lastMessage: conv.lastMessage,
      }));

      // Combine and sort by last message time
      const allConvos = [...groupConvos, ...dmConvos].sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt || 0;
        const bTime = b.lastMessage?.createdAt || b.createdAt || 0;
        return new Date(bTime) - new Date(aTime);
      });

      setConversations(allConvos);

      // Auto-select conversation if URL param provided or select first
      if (dmUserId) {
        const dmConv = allConvos.find(c => c.type === 'dm' && c._id === dmUserId);
        if (dmConv) {
          setActiveConversation(dmConv);
        }
      } else if (allConvos.length > 0) {
        setActiveConversation(allConvos[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeConversation) return;

    try {
      if (activeConversation.type === 'group') {
        const response = await messageAPI.getGroupMessages(activeConversation._id);
        setMessages(response.data.data.messages || []);
      } else if (activeConversation.type === 'dm') {
        const response = await messageAPI.getDirectMessages(activeConversation._id);
        setMessages(response.data.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageText,
      senderId: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl },
      createdAt: new Date().toISOString(),
      groupId: activeConversation.type === 'group' ? activeConversation._id : undefined,
      receiverId: activeConversation.type === 'dm' ? activeConversation._id : undefined,
      channelType: activeConversation.type === 'group' ? 'GROUP' : 'DM',
    };

    // Optimistic update - add message immediately to UI
    setMessages(prev => [...prev, tempMessage]);
    const messageContent = messageText;
    setMessageText('');

    setSending(true);
    try {
      let response;
      if (activeConversation.type === 'group') {
        response = await messageAPI.sendGroupMessage({
          content: messageContent,
          channelType: 'GROUP',
          groupId: activeConversation._id,
        });
      } else if (activeConversation.type === 'dm') {
        response = await messageAPI.sendDirectMessage({
          content: messageContent,
          receiverId: activeConversation._id,
        });
      }

      // Replace temp message with real message from server
      if (response?.data?.data?.message) {
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? response.data.data.message : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setMessageText(messageContent); // Restore the message text
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (query) => {
    if (!query.trim()) {
      setSearchedUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await userAPI.searchUsers(query);
      // Filter out current user
      const users = response.data.data.users.filter(u => u._id !== user._id);
      setSearchedUsers(users);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleStartDM = (selectedUser) => {
    // Check if conversation already exists
    const existingConv = conversations.find(c => c.type === 'dm' && c._id === selectedUser._id);
    
    if (existingConv) {
      setActiveConversation(existingConv);
    } else {
      // Create new conversation object
      const newConv = {
        _id: selectedUser._id,
        type: 'dm',
        name: selectedUser.name,
        avatar: selectedUser.avatarUrl,
        status: selectedUser.status,
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
    }
    
    setShowNewDMModal(false);
    setUserSearchQuery('');
    setSearchedUsers([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastMessageTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return msgDate.toLocaleDateString();
  };

  const getFilteredConversations = () => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(conv =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <button
              onClick={() => setShowNewDMModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="New Direct Message"
            >
              <FiPlus className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {getFilteredConversations().length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
              <button
                onClick={() => setShowNewDMModal(true)}
                className="block w-full mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            getFilteredConversations().map((convo) => (
              <button
                key={convo._id}
                onClick={() => setActiveConversation(convo)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  activeConversation?._id === convo._id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={convo.avatar || convo.avatarUrl}
                    name={convo.name}
                    size="md"
                  />
                  {convo.type === 'dm' && convo.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {convo.name}
                    </h3>
                    {convo.lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatLastMessageTime(convo.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {convo.lastMessage 
                        ? convo.lastMessage.content 
                        : convo.type === 'group' ? 'Group Chat' : 'Start chatting'}
                    </p>
                    {convo.type === 'group' ? (
                      <FiUsers size={14} className="text-gray-400 dark:text-gray-500 ml-2" />
                    ) : (
                      <FiUser size={14} className="text-gray-400 dark:text-gray-500 ml-2" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={activeConversation.avatar || activeConversation.avatarUrl}
                name={activeConversation.name}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {activeConversation.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeConversation.type === 'group' 
                    ? 'Group Chat' 
                    : activeConversation.status === 'online' 
                      ? 'Online' 
                      : 'Offline'}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiMoreVertical className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwnMessage = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                const showAvatar = index === 0 || messages[index - 1].senderId?._id !== msg.senderId?._id;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {showAvatar && !isOwnMessage && (
                        <Avatar
                          src={msg.senderId?.avatarUrl}
                          name={msg.senderId?.name || 'User'}
                          size="xs"
                        />
                      )}
                      <div>
                        {showAvatar && !isOwnMessage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
                            {msg.senderId?.name || 'User'}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-primary-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage
                                ? 'text-primary-100'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSend size={20} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Choose a group or start a direct message
            </p>
            <button
              onClick={() => setShowNewDMModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}

      {/* New DM Modal */}
      <Modal
        isOpen={showNewDMModal}
        onClose={() => {
          setShowNewDMModal(false);
          setUserSearchQuery('');
          setSearchedUsers([]);
        }}
        title="Start a Direct Message"
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Search Users"
              value={userSearchQuery}
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
                handleSearchUsers(e.target.value);
              }}
              placeholder="Search by name or email..."
              icon={FiSearch}
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchingUsers ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : searchedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {userSearchQuery ? 'No users found' : 'Start typing to search users'}
              </div>
            ) : (
              searchedUsers.map((searchUser) => (
                <button
                  key={searchUser._id}
                  onClick={() => handleStartDM(searchUser)}
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Avatar
                    src={searchUser.avatarUrl}
                    name={searchUser.name}
                    size="md"
                  />
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {searchUser.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchUser.email}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    searchUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesPage;
