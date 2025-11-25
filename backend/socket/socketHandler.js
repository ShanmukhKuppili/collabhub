const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GroupMember = require('../models/GroupMember');
const Message = require('../models/Message');

/**
 * Socket.IO connection handler
 * Handles real-time events for chat, notifications, and presence
 */
module.exports = (io) => {
  // Map to track online users
  const onlineUsers = new Map();

  io.on('connection', async (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    
    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        socket.disconnect();
        return;
      }

      socket.userId = user._id.toString();
      socket.user = user;

      // Track online user
      onlineUsers.set(socket.userId, socket.id);

      // Update user status (don't wait for save to complete)
      User.findByIdAndUpdate(user._id, {
        status: 'online',
        lastSeen: new Date()
      }).catch(err => console.error('Error updating user status:', err));

      console.log(`✅ User authenticated: ${user.name} (${user._id})`);

      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      // Join user's group rooms
      const memberships = await GroupMember.find({ userId: socket.userId });
      memberships.forEach(membership => {
        socket.join(`group:${membership.groupId}`);
      });

      // Broadcast user online status
      io.emit('user:online', {
        userId: socket.userId,
        status: 'online',
      });

      // Handle joining a group room
      socket.on('group:join', async (groupId) => {
        const membership = await GroupMember.findOne({
          userId: socket.userId,
          groupId,
        });

        if (membership) {
          socket.join(`group:${groupId}`);
          console.log(`📥 User ${socket.userId} joined group ${groupId}`);
        }
      });

      // Handle leaving a group room
      socket.on('group:leave', (groupId) => {
        socket.leave(`group:${groupId}`);
        console.log(`📤 User ${socket.userId} left group ${groupId}`);
      });

      // Handle typing indicator for groups
      socket.on('typing:start', ({ groupId, userId }) => {
        socket.to(`group:${groupId}`).emit('typing:user', {
          groupId,
          userId,
          typing: true,
        });
      });

      socket.on('typing:stop', ({ groupId, userId }) => {
        socket.to(`group:${groupId}`).emit('typing:user', {
          groupId,
          userId,
          typing: false,
        });
      });

      // Handle typing indicator for DMs
      socket.on('dm:typing:start', ({ receiverId }) => {
        io.to(`user:${receiverId}`).emit('dm:typing', {
          userId: socket.userId,
          typing: true,
        });
      });

      socket.on('dm:typing:stop', ({ receiverId }) => {
        io.to(`user:${receiverId}`).emit('dm:typing', {
          userId: socket.userId,
          typing: false,
        });
      });

      // Handle message read receipts
      socket.on('message:read', ({ messageId, conversationId }) => {
        socket.to(`user:${conversationId}`).emit('message:read', {
          messageId,
          readBy: socket.userId,
        });
      });

      // Handle task updates (broadcast to group)
      socket.on('task:update', ({ groupId, task }) => {
        socket.to(`group:${groupId}`).emit('task:updated', task);
      });

      // Handle resource updates
      socket.on('resource:new', ({ groupId, resource }) => {
        socket.to(`group:${groupId}`).emit('resource:added', resource);
      });

      // Handle event updates
      socket.on('event:new', ({ groupId, event }) => {
        socket.to(`group:${groupId}`).emit('event:added', event);
      });

      // Handle sending group messages
      socket.on('send_group_message', async ({ groupId, content, attachmentUrl, channelType }) => {
        try {
          // Verify membership
          const membership = await GroupMember.findOne({
            userId: socket.userId,
            groupId,
          });

          if (!membership) {
            socket.emit('message:error', { message: 'Access denied' });
            return;
          }

          // Check if announcement and user is admin
          if (channelType === 'ANNOUNCEMENT') {
            if (!['OWNER', 'ADMIN'].includes(membership.role)) {
              socket.emit('message:error', { message: 'Only admins can post announcements' });
              return;
            }
          }

          // Save message to database
          const message = await Message.create({
            senderId: socket.userId,
            groupId,
            content,
            attachmentUrl,
            channelType: channelType || 'GROUP',
          });

          await message.populate('senderId', 'name email avatarUrl');

          // Broadcast to group room (including sender)
          io.to(`group:${groupId}`).emit('group_message', message);
        } catch (error) {
          console.error('Send group message error:', error);
          socket.emit('message:error', { message: 'Error sending message' });
        }
      });

      // Handle sending direct messages
      socket.on('send_dm', async ({ receiverId, content, attachmentUrl }) => {
        try {
          // Save message to database
          const message = await Message.create({
            senderId: socket.userId,
            receiverId,
            content,
            attachmentUrl,
            channelType: 'DM',
          });

          await message.populate('senderId receiverId', 'name email avatarUrl');

          // Send to both sender and receiver
          io.to(`user:${receiverId}`).emit('dm_message', message);
          io.to(`user:${socket.userId}`).emit('dm_message', message);
        } catch (error) {
          console.error('Send DM error:', error);
          socket.emit('message:error', { message: 'Error sending message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log('❌ Socket disconnected:', socket.id);

        onlineUsers.delete(socket.userId);

        // Update user status to offline (non-blocking)
        if (socket.userId) {
          User.findByIdAndUpdate(socket.userId, {
            status: 'offline',
            lastSeen: new Date()
          }).then(() => {
            // Broadcast user offline status
            io.emit('user:offline', {
              userId: socket.userId,
              status: 'offline',
              lastSeen: new Date(),
            });
          }).catch(err => console.error('Error updating user status on disconnect:', err));
        }
      });

      // Get online users in a group
      socket.on('group:online', async ({ groupId }) => {
        const members = await GroupMember.find({ groupId }).select('userId');
        const onlineMembers = members
          .filter(m => onlineUsers.has(m.userId.toString()))
          .map(m => m.userId.toString());

        socket.emit('group:online:list', {
          groupId,
          onlineUsers: onlineMembers,
        });
      });

    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.disconnect();
    }
  });

  console.log('✅ Socket.IO handler initialized');
};
