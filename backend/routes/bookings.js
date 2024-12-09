const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                bookings: true,
            },
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if event is already fully booked
        if (event.bookings.length >= event.capacity) {
            return res.status(400).json({ error: 'Event is fully booked' });
        }

        // Check if user already has a booking for this event
        const existingBooking = await prisma.booking.findFirst({
            where: {
                userId: userId,
                eventId: eventId,
            },
        });

        if (existingBooking) {
            return res.status(400).json({ error: 'You have already booked this event' });
        }

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                userId: userId,
                eventId: eventId,
                status: 'CONFIRMED',
            },
            include: {
                event: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Get user's bookings
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await prisma.booking.findMany({
            where: {
                userId: userId,
            },
            include: {
                event: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get event's bookings (admin only)
router.get('/event/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can view event bookings' });
        }

        const eventId = parseInt(req.params.id);
        const bookings = await prisma.booking.findMany({
            where: {
                eventId: eventId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching event bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Update booking status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = parseInt(req.params.id);

        // Validate status
        const validStatuses = ['CONFIRMED', 'CANCELLED', 'PENDING'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid booking status' });
        }

        // Get the booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { event: true },
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if user is authorized to update the booking
        if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to update this booking' });
        }

        // Update the booking
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: {
                event: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

module.exports = router;
