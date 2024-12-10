const { rest } = require('msw');

const API_URL = 'http://localhost:3000';

const handlers = [
  // Auth handlers
  rest.post(`${API_URL}/api/auth/login`, async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'fake-token',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER'
          }
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  }),

  // Events handlers
  rest.get(`${API_URL}/api/events`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          date: '2024-12-31T18:00:00.000Z',
          location: 'Test Location',
          capacity: 100,
          price: 50,
          bookings: []
        }
      ])
    );
  }),

  rest.get(`${API_URL}/api/events/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 50,
        bookings: []
      })
    );
  }),

  rest.post(`${API_URL}/api/bookings`, async (req, res, ctx) => {
    const { eventId } = await req.json();
    
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        userId: 1,
        eventId: parseInt(eventId),
        status: 'CONFIRMED'
      })
    );
  })
];

module.exports = { handlers };
