import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create event (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, date, location, capacity, price } = req.body;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
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
        },
        registrations: true,
        bookings: true
      }
    });

    // Add available places count to each event
    const eventsWithPlaces = events.map(event => {
      const totalRegistrations = event.registrations.length + event.bookings.length;
      const availablePlaces = event.capacity - totalRegistrations;
      return {
        ...event,
        availablePlaces,
        totalRegistrations,
        registrations: undefined,
        bookings: undefined
      };
    });

    res.json(eventsWithPlaces);
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
        },
        registrations: true,
        bookings: true
      }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Add available places count
    const totalRegistrations = event.registrations.length + event.bookings.length;
    const availablePlaces = event.capacity - totalRegistrations;
    const eventWithPlaces = {
      ...event,
      availablePlaces,
      totalRegistrations,
      registrations: undefined,
      bookings: undefined
    };
    
    res.json(eventWithPlaces);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Register for an event (authenticated users)
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        registrations: true,
        bookings: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check capacity
    const totalRegistrations = event.registrations.length + event.bookings.length;
    if (totalRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check if user already registered
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: parseInt(id)
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: userId,
        eventId: parseInt(id),
        status: 'CONFIRMED'
      },
    });

    res.json(booking);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

// Cancel event registration
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: parseInt(id)
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Delete the booking
    await prisma.booking.delete({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: parseInt(id)
        }
      }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: 'Failed to cancel registration' });
  }
});

// Get registration status for a user
router.get('/:id/registration-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: parseInt(id)
        }
      }
    });

    res.json({ isRegistered: !!booking });
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({ message: 'Failed to check registration status' });
  }
});

// Get event registrations (admin only)
router.get('/:id/registrations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        registrations: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Combine and format registrations
    const registrations = [
      ...event.bookings.map(booking => ({
        id: `user-${booking.user.id}`,
        name: booking.user.name,
        email: booking.user.email,
        type: 'User',
        registeredAt: booking.createdAt
      })),
      ...event.registrations.map(reg => ({
        id: `guest-${reg.id}`,
        name: reg.fullName,
        email: reg.email,
        type: 'Guest',
        registeredAt: reg.createdAt
      }))
    ].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    res.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date
      },
      registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
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
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
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

export default router;
