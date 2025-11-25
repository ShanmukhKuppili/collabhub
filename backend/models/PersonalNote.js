const mongoose = require('mongoose');

/**
 * PersonalNote Schema
 * Represents personal notes for individual users
 */
const personalNoteSchema = new mongoose.Schema({
  userId: {
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
personalNoteSchema.index({ userId: 1, createdAt: -1 });
personalNoteSchema.index({ tags: 1 });

module.exports = mongoose.model('PersonalNote', personalNoteSchema);
