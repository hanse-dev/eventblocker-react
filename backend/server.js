import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import usersRouter from './routes/users.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);

// Guest registration endpoint
app.post('/api/events/:id/register-guest', async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone } = req.body;

  try {
    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Create guest registration
    const registration = await prisma.registration.create({
      data: {
        eventId: parseInt(id),
        fullName,
        email,
        phone,
        isGuest: true
      },
    });

    res.json(registration);
  } catch (error) {
    console.error('Error registering guest:', error);
    res.status(500).json({ message: 'Failed to register guest: ' + error.message });
  }
});

// Only start the server if this file is run directly
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
