const mongoose = require('mongoose');

/**
 * Group Schema
 * Represents a collaboration group/workspace
 */
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Invite code for easy joining
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

// Indexes
groupSchema.index({ ownerId: 1 });
groupSchema.index({ type: 1 });

module.exports = mongoose.model('Group', groupSchema);
