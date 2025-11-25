const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createGroup,
  getUserGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  joinGroup,
  getJoinRequests,
  processJoinRequest,
  removeMember,
  updateMemberRole,
  leaveGroup,
} = require('../controllers/group.controller');
const groupNoteController = require('../controllers/groupNote.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post('/', createGroup);

/**
 * @route   GET /api/groups
 * @desc    Get all groups for current user
 * @access  Private
 */
router.get('/', getUserGroups);

/**
 * @route   POST /api/groups/join
 * @desc    Join group via invite code
 * @access  Private
 */
router.post('/join', joinGroup);

/**
 * @route   GET /api/groups/:groupId
 * @desc    Get group by ID
 * @access  Private
 */
router.get('/:groupId', getGroupById);

/**
 * @route   PUT /api/groups/:groupId
 * @desc    Update group
 * @access  Private (Admin/Owner)
 */
router.put('/:groupId', updateGroup);

/**
 * @route   DELETE /api/groups/:groupId
 * @desc    Delete group
 * @access  Private (Owner only)
 */
router.delete('/:groupId', deleteGroup);

/**
 * @route   GET /api/groups/:groupId/members
 * @desc    Get group members
 * @access  Private (Members only)
 */
router.get('/:groupId/members', getGroupMembers);

/**
 * @route   GET /api/groups/:groupId/join-requests
 * @desc    Get join requests for a group
 * @access  Private (Admin/Owner)
 */
router.get('/:groupId/join-requests', getJoinRequests);

/**
 * @route   PUT /api/groups/:groupId/join-requests/:requestId
 * @desc    Approve/reject join request
 * @access  Private (Admin/Owner)
 */
router.put('/:groupId/join-requests/:requestId', processJoinRequest);

/**
 * @route   DELETE /api/groups/:groupId/members/:memberId
 * @desc    Remove member from group
 * @access  Private (Admin/Owner)
 */
router.delete('/:groupId/members/:memberId', removeMember);

/**
 * @route   PUT /api/groups/:groupId/members/:memberId/role
 * @desc    Update member role
 * @access  Private (Owner only)
 */
router.put('/:groupId/members/:memberId/role', updateMemberRole);

/**
 * @route   POST /api/groups/:groupId/leave
 * @desc    Leave group
 * @access  Private
 */
router.post('/:groupId/leave', leaveGroup);

/**
 * Group Notes Routes
 */

/**
 * @route   POST /api/groups/:groupId/notes
 * @desc    Create group note
 * @access  Private (Members only)
 */
router.post('/:groupId/notes', groupNoteController.createNote);

/**
 * @route   GET /api/groups/:groupId/notes
 * @desc    Get group notes
 * @access  Private (Members only)
 */
router.get('/:groupId/notes', groupNoteController.getNotes);

/**
 * @route   PUT /api/groups/:groupId/notes/:noteId
 * @desc    Update group note
 * @access  Private (Members only)
 */
router.put('/:groupId/notes/:noteId', groupNoteController.updateNote);

/**
 * @route   DELETE /api/groups/:groupId/notes/:noteId
 * @desc    Delete group note
 * @access  Private (Members only)
 */
router.delete('/:groupId/notes/:noteId', groupNoteController.deleteNote);

module.exports = router;
