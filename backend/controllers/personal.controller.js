const PersonalNote = require('../models/PersonalNote');

/**
 * Create personal note
 * POST /api/personal/notes
 */
const createNote = async (req, res) => {
  try {
    const { title, content, tags, color } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required',
      });
    }

    const note = await PersonalNote.create({
      userId: req.userId,
      title,
      content,
      tags: tags || [],
      color: color || 'blue',
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note },
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating note',
      error: error.message,
    });
  }
};

/**
 * Get personal notes
 * GET /api/personal/notes?tag=xxx
 */
const getNotes = async (req, res) => {
  try {
    const { tag } = req.query;

    const filter = { userId: req.userId };
    if (tag) filter.tags = tag;

    const notes = await PersonalNote.find(filter).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { notes },
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
      error: error.message,
    });
  }
};

/**
 * Update note
 * PUT /api/personal/notes/:noteId
 */
const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, tags, color } = req.body;

    const note = await PersonalNote.findOne({
      _id: noteId,
      userId: req.userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (title) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags) note.tags = tags;
    if (color) note.color = color;

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note },
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating note',
      error: error.message,
    });
  }
};

/**
 * Delete note
 * DELETE /api/personal/notes/:noteId
 */
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await PersonalNote.findOne({
      _id: noteId,
      userId: req.userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Delete note error:', error);
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
