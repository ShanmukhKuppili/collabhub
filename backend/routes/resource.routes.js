const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createResource,
  getResources,
  deleteResource,
  upload,
} = require('../controllers/resource.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/resources
 * @desc    Create resource (with optional file upload)
 * @access  Private
 */
router.post('/', upload.single('file'), createResource);

/**
 * @route   GET /api/resources
 * @desc    Get resources for a group
 * @access  Private
 */
router.get('/', getResources);

/**
 * @route   DELETE /api/resources/:resourceId
 * @desc    Delete resource
 * @access  Private
 */
router.delete('/:resourceId', deleteResource);

module.exports = router;
