const mongoose = require('mongoose');

/**
 * Message Schema
 * Handles group messages, announcements, and direct messages
 */
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // For group messages and announcements
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  // For direct messages
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
  },
  attachmentUrl: {
    type: String,
  },
  channelType: {
    type: String,
    enum: ['GROUP', 'ANNOUNCEMENT', 'DM'],
    required: true,
  },
  editedAt: {
    type: Date,
  },
  // Track message read status for DMs
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ channelType: 1 });

module.exports = mongoose.model('Message', messageSchema);
