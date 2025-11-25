const Resource = require('../models/Resource');
const GroupMember = require('../models/GroupMember');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resources';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/**
 * Create resource (file, link, or note)
 * POST /api/resources
 */
const createResource = async (req, res) => {
  try {
    const { groupId, type, title, description, url, content, tags } = req.body;

    if (!groupId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, type, and title are required',
      });
    }

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const resourceData = {
      groupId,
      type,
      title,
      description,
      createdBy: req.userId,
    };

    // Parse tags if provided as string (from FormData)
    if (tags) {
      resourceData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    if (type === 'FILE' && req.file) {
      resourceData.filePath = req.file.path;
      resourceData.fileSize = req.file.size;
      resourceData.mimeType = req.file.mimetype;
    } else if (type === 'LINK') {
      resourceData.url = url;
    } else if (type === 'NOTE') {
      resourceData.content = content;
    }

    const resource = await Resource.create(resourceData);
    await resource.populate('createdBy', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource },
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: error.message,
    });
  }
};

/**
 * Get resources for a group
 * GET /api/resources?groupId=xxx&type=xxx&tag=xxx&search=xxx
 */
const getResources = async (req, res) => {
  try {
    const { groupId, type, tag, search } = req.query;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required',
      });
    }

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const filter = { groupId };
    if (type) filter.type = type;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate('createdBy', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { resources },
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message,
    });
  }
};

/**
 * Delete resource
 * DELETE /api/resources/:resourceId
 */
const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId: resource.groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Delete file if exists
    if (resource.type === 'FILE' && resource.filePath) {
      if (fs.existsSync(resource.filePath)) {
        fs.unlinkSync(resource.filePath);
      }
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message,
    });
  }
};

module.exports = {
  createResource,
  getResources,
  deleteResource,
  upload,
};
