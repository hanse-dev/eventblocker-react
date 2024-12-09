const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all events (public)
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
    res.status(500).json({ error: error.message });
  }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, date, location, capacity, price } = req.body;
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: parseInt(capacity),
        price: parseFloat(price),
        userId: req.user.id
      }
    });
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, capacity, price } = req.body;
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: parseInt(capacity),
        price: parseFloat(price)
      }
    });
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.event.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
