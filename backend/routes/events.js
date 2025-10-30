const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const User = require('../models/User');
const updateXP = require('../utils/updateXP');

const router = express.Router();

// Get recommended events
router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const allEvents = await Event.find().sort({ date: 1 });
    
    // Filter events based on user interests
    const recommendedEvents = allEvents
      .filter(event => {
        return event.tags.some(tag => 
          currentUser.interests.some(interest => 
            interest.toLowerCase() === tag.toLowerCase()
          )
        );
      })
      .slice(0, 5);

    res.json(recommendedEvents);
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ message: 'Server error getting events' });
  }
});

// Create new event (for admin or any user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, date, time, location, tags, description } = req.body;

    const event = new Event({
      title,
      date,
      time,
      location,
      tags,
      description: description || ''
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// Join an event and earn XP
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.body;
    const currentUser = req.user;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already joined
    const eventMongoId = new mongoose.Types.ObjectId(eventId);
    const alreadyJoined = currentUser.joinedEvents && currentUser.joinedEvents.some(
      joinedEvent => joinedEvent.toString() === eventId.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ 
        message: 'You have already joined this event!',
        alreadyJoined: true,
        xp: currentUser.xp
      });
    }

    // Add event to joinedEvents
    if (!currentUser.joinedEvents) {
      currentUser.joinedEvents = [];
    }
    currentUser.joinedEvents.push(eventMongoId);
    await currentUser.save();

    // Add XP using utility function (only once per event)
    const updatedXP = await updateXP(currentUser._id, 20, `Joining event: ${event.title}`);

    res.json({
      message: 'Event joined successfully!',
      xp: updatedXP
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error joining event', error: error.message });
  }
});

module.exports = router;

