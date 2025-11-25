const mongoose = require('mongoose');

/**
 * GroupNote Schema
 * Represents notes shared within a group
 */
const groupNoteSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Note content cannot exceed 50000 characters'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  color: {
    type: String,
    default: 'blue',
  },
}, {
  timestamps: true,
});

// Indexes
groupNoteSchema.index({ groupId: 1, createdAt: -1 });
groupNoteSchema.index({ tags: 1 });

module.exports = mongoose.model('GroupNote', groupNoteSchema);
