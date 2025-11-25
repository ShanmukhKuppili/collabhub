const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/events
 * @desc    Create event
 * @access  Private
 */
router.post('/', createEvent);

/**
 * @route   GET /api/events
 * @desc    Get events for a group
 * @access  Private
 */
router.get('/', getEvents);

/**
 * @route   PUT /api/events/:eventId
 * @desc    Update event
 * @access  Private
 */
router.put('/:eventId', updateEvent);

/**
 * @route   DELETE /api/events/:eventId
 * @desc    Delete event
 * @access  Private
 */
router.delete('/:eventId', deleteEvent);

module.exports = router;
