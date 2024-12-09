const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Create event (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, date, location, capacity, price } = req.body;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: parseInt(capacity),
        price: parseFloat(price),
        userId: user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Update event (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const { title, description, date, location, capacity, price } = req.body;
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        capacity: capacity ? parseInt(capacity) : undefined,
        price: price ? parseFloat(price) : undefined
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    await prisma.event.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
