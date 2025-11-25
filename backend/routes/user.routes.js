const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  updateProfile,
  getCurrentUser,
  changePassword,
  getUserById,
  searchUsers,
} = require('../controllers/user.controller');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', getCurrentUser);

/**
 * @route   PUT /api/users/me
 * @desc    Update user profile and settings
 * @access  Private
 */
router.put('/me', updateProfile);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', changePassword);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (deprecated, use /me)
 * @access  Private
 */
router.put('/profile', updateProfile);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search', searchUsers);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:userId', getUserById);

module.exports = router;
