const mongoose = require('mongoose');

/**
 * GroupMember Schema
 * Represents membership relationship between users and groups
 */
const groupMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  role: {
    type: String,
    enum: ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'],
    default: 'MEMBER',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique user-group combinations
groupMemberSchema.index({ userId: 1, groupId: 1 }, { unique: true });

// Index for faster queries
groupMemberSchema.index({ groupId: 1 });
groupMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('GroupMember', groupMemberSchema);
