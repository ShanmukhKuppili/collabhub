const Task = require('../models/Task');
const TaskComment = require('../models/TaskComment');
const GroupMember = require('../models/GroupMember');

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res) => {
  try {
    const { groupId, title, description, status, priority, dueDate, assignees } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // If groupId provided, verify user is member
    if (groupId) {
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
    }

    const task = await Task.create({
      groupId: groupId || null,
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate,
      createdBy: req.userId,
      assignees: assignees || [],
    });

    await task.populate('createdBy assignees', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};

/**
 * Get tasks (group or personal)
 * GET /api/tasks?groupId=xxx&status=xxx&assignee=xxx
 */
const getTasks = async (req, res) => {
  try {
    const { groupId, status, assignee, priority } = req.query;

    const filter = {};

    if (groupId) {
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

      filter.groupId = groupId;
    } else {
      // Personal tasks
      filter.groupId = null;
      filter.createdBy = req.userId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;

    const tasks = await Task.find(filter)
      .populate('createdBy assignees', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

/**
 * Get task by ID
 * GET /api/tasks/:taskId
 */
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('createdBy assignees', 'name email avatarUrl');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check access
    if (task.groupId) {
      const membership = await GroupMember.findOne({
        userId: req.userId,
        groupId: task.groupId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      // Personal task - check ownership
      if (task.createdBy._id.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message,
    });
  }
};

/**
 * Update task
 * PUT /api/tasks/:taskId
 */
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignees } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check access
    if (task.groupId) {
      const membership = await GroupMember.findOne({
        userId: req.userId,
        groupId: task.groupId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      if (task.createdBy.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignees) task.assignees = assignees;

    await task.save();
    await task.populate('createdBy assignees', 'name email avatarUrl');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

/**
 * Delete task
 * DELETE /api/tasks/:taskId
 */
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check access
    if (task.groupId) {
      const membership = await GroupMember.findOne({
        userId: req.userId,
        groupId: task.groupId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      if (task.createdBy.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    await TaskComment.deleteMany({ taskId });
    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

/**
 * Get task comments
 * GET /api/tasks/:taskId/comments
 */
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check access
    if (task.groupId) {
      const membership = await GroupMember.findOne({
        userId: req.userId,
        groupId: task.groupId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      if (task.createdBy.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    const comments = await TaskComment.find({ taskId })
      .populate('authorId', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { comments },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message,
    });
  }
};

/**
 * Add task comment
 * POST /api/tasks/:taskId/comments
 */
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check access
    if (task.groupId) {
      const membership = await GroupMember.findOne({
        userId: req.userId,
        groupId: task.groupId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      if (task.createdBy.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    const comment = await TaskComment.create({
      taskId,
      authorId: req.userId,
      content,
    });

    await comment.populate('authorId', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
};
