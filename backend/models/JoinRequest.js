const mongoose = require('mongoose');

/**
 * JoinRequest Schema
 * Handles requests to join private groups
 */
const joinRequestSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  message: {
    type: String,
    default: '',
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate requests
joinRequestSchema.index({ userId: 1, groupId: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
