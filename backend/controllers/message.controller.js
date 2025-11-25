const Message = require('../models/Message');
const GroupMember = require('../models/GroupMember');
const mongoose = require('mongoose');

/**
 * Send group message
 * POST /api/messages/group
 */
const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content, attachmentUrl, channelType } = req.body;

    if (!groupId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and content are required',
      });
    }

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Check if announcement and user is admin
    if (channelType === 'ANNOUNCEMENT') {
      if (!['OWNER', 'ADMIN'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only admins can post announcements',
        });
      }
    }

    const message = await Message.create({
      senderId: req.userId,
      groupId,
      content,
      attachmentUrl,
      channelType: channelType || 'GROUP',
    });

    await message.populate('senderId', 'name email avatarUrl');

    // Emit via Socket.IO
    const io = req.app.get('io');
    io.to(`group:${groupId}`).emit('message:new', message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

/**
 * Get group messages
 * GET /api/messages/group/:groupId?limit=50&before=xxx
 */
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before, channelType } = req.query;

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const filter = { groupId };
    
    if (channelType) {
      filter.channelType = channelType;
    } else {
      filter.channelType = { $in: ['GROUP', 'ANNOUNCEMENT'] };
    }
    
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .populate('senderId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { messages: messages.reverse() },
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Send direct message
 * POST /api/messages/dm
 */
const sendDirectMessage = async (req, res) => {
  try {
    const { receiverId, content, attachmentUrl } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required',
      });
    }

    const message = await Message.create({
      senderId: req.userId,
      receiverId,
      content,
      attachmentUrl,
      channelType: 'DM',
    });

    await message.populate('senderId receiverId', 'name email avatarUrl');

    // Emit via Socket.IO to both users
    const io = req.app.get('io');
    io.to(`user:${receiverId}`).emit('message:dm', message);
    io.to(`user:${req.userId}`).emit('message:dm', message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    console.error('Send DM error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

/**
 * Get direct messages with a user
 * GET /api/messages/dm/:userId?limit=50&before=xxx
 */
const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;

    const filter = {
      channelType: 'DM',
      $or: [
        { senderId: req.userId, receiverId: userId },
        { senderId: userId, receiverId: req.userId },
      ],
    };

    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .populate('senderId receiverId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: req.userId,
        read: false,
      },
      { read: true }
    );

    res.json({
      success: true,
      data: { messages: messages.reverse() },
    });
  } catch (error) {
    console.error('Get DM error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Get DM conversations list
 * GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    // Aggregate to get latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          channelType: 'DM',
          $or: [
            { senderId: new mongoose.Types.ObjectId(req.userId) },
            { receiverId: new mongoose.Types.ObjectId(req.userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(req.userId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            email: 1,
            avatarUrl: 1,
            status: 1,
            lastSeen: 1,
          },
          lastMessage: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

/**
 * Get unread message count
 * GET /api/messages/unread
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.userId,
      channelType: 'DM',
      read: false,
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

module.exports = {
  sendGroupMessage,
  getGroupMessages,
  sendDirectMessage,
  getDirectMessages,
  getConversations,
  getUnreadCount,
};
