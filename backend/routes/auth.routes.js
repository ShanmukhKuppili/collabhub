const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (update status)
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;
