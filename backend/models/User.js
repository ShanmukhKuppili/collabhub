const mongoose = require('mongoose');

/**
 * User Schema
 * Represents a user in the system with authentication and profile information
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  // Settings
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  notificationSettings: {
    notifyOnGroupMessage: {
      type: Boolean,
      default: true,
    },
    notifyOnTaskAssignment: {
      type: Boolean,
      default: true,
    },
    notifyOnEventReminder: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Remove password hash from JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
