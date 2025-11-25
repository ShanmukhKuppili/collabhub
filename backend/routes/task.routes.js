const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
} = require('../controllers/task.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get tasks (group or personal, with filters)
 * @access  Private
 */
router.get('/', getTasks);

/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:taskId', getTaskById);

/**
 * @route   PUT /api/tasks/:taskId
 * @desc    Update task
 * @access  Private
 */
router.put('/:taskId', updateTask);

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete task
 * @access  Private
 */
router.delete('/:taskId', deleteTask);

/**
 * @route   GET /api/tasks/:taskId/comments
 * @desc    Get task comments
 * @access  Private
 */
router.get('/:taskId/comments', getTaskComments);

/**
 * @route   POST /api/tasks/:taskId/comments
 * @desc    Add task comment
 * @access  Private
 */
router.post('/:taskId/comments', addTaskComment);

module.exports = router;
