const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const JoinRequest = require('../models/JoinRequest');
const crypto = require('crypto');

/**
 * Generate unique invite code
 */
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * Create a new group
 * POST /api/groups
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, avatarUrl, type, tags } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let codeExists = await Group.findOne({ inviteCode });
    
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await Group.findOne({ inviteCode });
    }

    // Create group
    const group = await Group.create({
      name,
      description,
      avatarUrl,
      type: type || 'private',
      tags: tags || [],
      ownerId: req.userId,
      inviteCode,
    });

    // Add creator as owner member
    await GroupMember.create({
      userId: req.userId,
      groupId: group._id,
      role: 'OWNER',
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group },
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message,
    });
  }
};

/**
 * Get all groups for current user
 * GET /api/groups
 */
const getUserGroups = async (req, res) => {
  try {
    // Find all group memberships for user
    const memberships = await GroupMember.find({ userId: req.userId })
      .populate('groupId')
      .sort({ joinedAt: -1 });

    const groups = memberships.map(m => ({
      ...m.groupId.toObject(),
      memberRole: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json({
      success: true,
      data: { groups },
    });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message,
    });
  }
};

/**
 * Get group by ID
 * GET /api/groups/:groupId
 */
const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate('ownerId', 'name email avatarUrl');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is member
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!membership && group.type === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const groupData = {
      ...group.toObject(),
      memberRole: membership ? membership.role : null,
      isMember: !!membership,
    };

    res.json({
      success: true,
      data: { group: groupData },
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: error.message,
    });
  }
};

/**
 * Update group
 * PUT /api/groups/:groupId
 */
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatarUrl, type, tags } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is admin or owner
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
      role: { $in: ['OWNER', 'ADMIN'] },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can update group settings',
      });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatarUrl !== undefined) group.avatarUrl = avatarUrl;
    if (type) group.type = type;
    if (tags) group.tags = tags;

    await group.save();

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group },
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating group',
      error: error.message,
    });
  }
};

/**
 * Delete group
 * DELETE /api/groups/:groupId
 */
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Only owner can delete
    if (group.ownerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can delete the group',
      });
    }

    // Delete all related data
    await GroupMember.deleteMany({ groupId });
    await JoinRequest.deleteMany({ groupId });
    await group.deleteOne();

    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message,
    });
  }
};

/**
 * Get group members
 * GET /api/groups/:groupId/members
 */
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is member
    const userMembership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const members = await GroupMember.find({ groupId })
      .populate('userId', 'name email avatarUrl status lastSeen')
      .sort({ role: 1, joinedAt: 1 });

    res.json({
      success: true,
      data: { members },
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: error.message,
    });
  }
};

/**
 * Join group via invite code
 * POST /api/groups/join
 */
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required',
      });
    }

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code',
      });
    }

    // Check if already member
    const existing = await GroupMember.findOne({
      userId: req.userId,
      groupId: group._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group',
      });
    }

    // If private group, create join request
    if (group.type === 'private') {
      // Check for existing pending request
      const existingRequest = await JoinRequest.findOne({
        userId: req.userId,
        groupId: group._id,
        status: 'PENDING',
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending join request',
        });
      }

      await JoinRequest.create({
        userId: req.userId,
        groupId: group._id,
        status: 'PENDING',
      });

      return res.json({
        success: true,
        message: 'Join request sent. Waiting for approval.',
      });
    }

    // Public group - join immediately
    await GroupMember.create({
      userId: req.userId,
      groupId: group._id,
      role: 'MEMBER',
    });

    res.json({
      success: true,
      message: 'Joined group successfully',
      data: { group },
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining group',
      error: error.message,
    });
  }
};

/**
 * Get join requests for a group
 * GET /api/groups/:groupId/join-requests
 */
const getJoinRequests = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is admin
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
      role: { $in: ['OWNER', 'ADMIN'] },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view join requests',
      });
    }

    const requests = await JoinRequest.find({
      groupId,
      status: 'PENDING',
    })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching join requests',
      error: error.message,
    });
  }
};

/**
 * Approve/reject join request
 * PUT /api/groups/:groupId/join-requests/:requestId
 */
const processJoinRequest = async (req, res) => {
  try {
    const { groupId, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    // Check if user is admin
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
      role: { $in: ['OWNER', 'ADMIN'] },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process join requests',
      });
    }

    const request = await JoinRequest.findById(requestId);

    if (!request || request.groupId.toString() !== groupId) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed',
      });
    }

    if (action === 'approve') {
      // Add user as member
      await GroupMember.create({
        userId: request.userId,
        groupId,
        role: 'MEMBER',
      });

      request.status = 'APPROVED';
      request.processedBy = req.userId;
      request.processedAt = new Date();
      await request.save();

      res.json({
        success: true,
        message: 'Join request approved',
      });
    } else if (action === 'reject') {
      request.status = 'REJECTED';
      request.processedBy = req.userId;
      request.processedAt = new Date();
      await request.save();

      res.json({
        success: true,
        message: 'Join request rejected',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action',
      });
    }
  } catch (error) {
    console.error('Process join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing join request',
      error: error.message,
    });
  }
};

/**
 * Remove member from group
 * DELETE /api/groups/:groupId/members/:memberId
 */
const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    // Check if requester is admin
    const requesterMembership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
      role: { $in: ['OWNER', 'ADMIN'] },
    });

    if (!requesterMembership) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members',
      });
    }

    const targetMembership = await GroupMember.findOne({
      userId: memberId,
      groupId,
    });

    if (!targetMembership) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Cannot remove owner
    if (targetMembership.role === 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Cannot remove group owner',
      });
    }

    await targetMembership.deleteOne();

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message,
    });
  }
};

/**
 * Update member role
 * PUT /api/groups/:groupId/members/:memberId/role
 */
const updateMemberRole = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MODERATOR', 'MEMBER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    // Only owner can change roles
    const group = await Group.findById(groupId);
    
    if (!group || group.ownerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can change member roles',
      });
    }

    const membership = await GroupMember.findOne({
      userId: memberId,
      groupId,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    if (membership.role === 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change owner role',
      });
    }

    membership.role = role;
    await membership.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: { membership },
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message,
    });
  }
};

/**
 * Leave group
 * POST /api/groups/:groupId/leave
 */
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    if (membership.role === 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Group owner cannot leave. Transfer ownership or delete the group.',
      });
    }

    await membership.deleteOne();

    res.json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving group',
      error: error.message,
    });
  }
};

module.exports = {
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
};
