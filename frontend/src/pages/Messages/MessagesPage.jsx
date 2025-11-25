import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiSend, FiSearch, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { messageAPI, groupAPI } from '../../services/api';
import { getSocket, joinGroupRoom, leaveGroupRoom, onSocketEvent, offSocketEvent } from '../../services/socket';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
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
  };

  const cleanupSocketListeners = () => {
    offSocketEvent('message:new', handleNewMessage);
    offSocketEvent('message:dm', handleNewDM);
  };

  const handleNewMessage = (message) => {
    if (activeConversation?.type === 'group' && message.groupId === activeConversation._id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleNewDM = (message) => {
    if (activeConversation?.type === 'dm' && 
        (message.senderId === activeConversation._id || message.receiverId === activeConversation._id)) {
      setMessages(prev => [...prev, message]);
    }
  };

  const fetchConversations = async () => {
    try {
      const groupsRes = await groupAPI.getUserGroups();

      const groupConvos = groupsRes.data.data.groups.map(group => ({
        ...group,
        type: 'group',
        name: group.name,
        avatar: group.avatarUrl,
      }));

      setConversations(groupConvos);

      if (groupConvos.length > 0) {
        setActiveConversation(groupConvos[0]);
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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    setSending(true);
    try {
      if (activeConversation.type === 'group') {
        await messageAPI.sendMessage({
          content: messageText,
          channelType: 'GROUP',
          groupId: activeConversation._id,
        });
      }

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo._id}
                onClick={() => setActiveConversation(convo)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  activeConversation?._id === convo._id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <Avatar
                  src={convo.avatar || convo.avatarUrl}
                  name={convo.name}
                  size="md"
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {convo.name}
                    </h3>
                    <FiUsers size={14} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Group Chat
                  </p>
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
                  Group Chat
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
            <p className="text-gray-500 dark:text-gray-400">
              Choose a group to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
