const GroupNote = require('../models/GroupNote');
const Group = require('../models/Group');

/**
 * Create group note
 * POST /api/groups/:groupId/notes
 */
const createNote = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, content, tags, color } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required',
      });
    }

    // Verify user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    const note = await GroupNote.create({
      groupId,
      createdBy: req.userId,
      title,
      content,
      tags: tags || [],
      color: color || 'default',
    });

    // Populate creator info
    await note.populate('createdBy', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note },
    });
  } catch (error) {
    console.error('Create group note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating note',
      error: error.message,
    });
  }
};

/**
 * Get group notes
 * GET /api/groups/:groupId/notes?tag=xxx
 */
const getNotes = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { tag } = req.query;

    const filter = { groupId };
    if (tag) filter.tags = tag;

    const notes = await GroupNote.find(filter)
      .populate('createdBy', 'name email avatarUrl')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { notes },
    });
  } catch (error) {
    console.error('Get group notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
      error: error.message,
    });
  }
};

/**
 * Update group note
 * PUT /api/groups/:groupId/notes/:noteId
 */
const updateNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    const { title, content, tags, color } = req.body;

    const note = await GroupNote.findOne({
      _id: noteId,
      groupId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;

    await note.save();
    await note.populate('createdBy', 'name email avatarUrl');

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note },
    });
  } catch (error) {
    console.error('Update group note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating note',
      error: error.message,
    });
  }
};

/**
 * Delete group note
 * DELETE /api/groups/:groupId/notes/:noteId
 */
const deleteNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;

    const note = await GroupNote.findOneAndDelete({
      _id: noteId,
      groupId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete group note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting note',
      error: error.message,
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
};
