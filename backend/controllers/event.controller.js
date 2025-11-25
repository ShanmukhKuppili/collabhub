const Event = require('../models/Event');
const GroupMember = require('../models/GroupMember');

/**
 * Create event
 * POST /api/events
 */
const createEvent = async (req, res) => {
  try {
    const { groupId, title, description, startTime, endTime, location } = req.body;

    if (!groupId || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, title, start time, and end time are required',
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

    const event = await Event.create({
      groupId,
      title,
      description,
      startTime,
      endTime,
      location,
      createdBy: req.userId,
    });

    await event.populate('createdBy', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
    });
  }
};

/**
 * Get events for a group
 * GET /api/events?groupId=xxx&startDate=xxx&endDate=xxx
 */
const getEvents = async (req, res) => {
  try {
    const { groupId, startDate, endDate } = req.query;

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
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email avatarUrl')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      data: { events },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

/**
 * Update event
 * PUT /api/events/:eventId
 */
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, startTime, endTime, location } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId: event.groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location !== undefined) event.location = location;

    await event.save();
    await event.populate('createdBy', 'name email avatarUrl');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event },
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message,
    });
  }
};

/**
 * Delete event
 * DELETE /api/events/:eventId
 */
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Verify membership
    const membership = await GroupMember.findOne({
      userId: req.userId,
      groupId: event.groupId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
};
