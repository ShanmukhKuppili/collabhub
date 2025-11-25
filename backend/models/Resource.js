const mongoose = require('mongoose');

/**
 * Resource Schema
 * Represents shared resources in a group (files, links, notes)
 */
const resourceSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  type: {
    type: String,
    enum: ['FILE', 'LINK', 'NOTE'],
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  // For files
  filePath: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  // For links
  url: {
    type: String,
  },
  // For notes
  content: {
    type: String,
    maxlength: [10000, 'Note content cannot exceed 10000 characters'],
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
resourceSchema.index({ groupId: 1, type: 1 });
resourceSchema.index({ createdBy: 1 });
resourceSchema.index({ tags: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
