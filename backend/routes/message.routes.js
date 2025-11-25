const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  sendGroupMessage,
  getGroupMessages,
  sendDirectMessage,
  getDirectMessages,
  getConversations,
  getUnreadCount,
} = require('../controllers/message.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/messages/group
 * @desc    Send group message
 * @access  Private
 */
router.post('/group', sendGroupMessage);

/**
 * @route   GET /api/messages/group/:groupId
 * @desc    Get group messages
 * @access  Private
 */
router.get('/group/:groupId', getGroupMessages);

/**
 * @route   POST /api/messages/dm
 * @desc    Send direct message
 * @access  Private
 */
router.post('/dm', sendDirectMessage);

/**
 * @route   GET /api/messages/dm/:userId
 * @desc    Get direct messages with a user
 * @access  Private
 */
router.get('/dm/:userId', getDirectMessages);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get DM conversations list
 * @access  Private
 */
router.get('/conversations', getConversations);

/**
 * @route   GET /api/messages/unread
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread', getUnreadCount);

module.exports = router;
