const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} = require('../controllers/personal.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/personal/notes
 * @desc    Create personal note
 * @access  Private
 */
router.post('/notes', createNote);

/**
 * @route   GET /api/personal/notes
 * @desc    Get personal notes
 * @access  Private
 */
router.get('/notes', getNotes);

/**
 * @route   PUT /api/personal/notes/:noteId
 * @desc    Update note
 * @access  Private
 */
router.put('/notes/:noteId', updateNote);

/**
 * @route   DELETE /api/personal/notes/:noteId
 * @desc    Delete note
 * @access  Private
 */
router.delete('/notes/:noteId', deleteNote);

module.exports = router;
