const mongoose = require('mongoose');

/**
 * TaskComment Schema
 * Represents comments on tasks
 */
const taskCommentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
});

// Index for faster task comment retrieval
taskCommentSchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.model('TaskComment', taskCommentSchema);
