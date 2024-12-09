const { rest } = require('msw');

const handlers = [
  // Auth handlers
  rest.post('/api/auth/login', async (req, res, ctx) => {
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
      ctx.json({ error: 'Invalid credentials' })
    );
  }),

  // Events handlers
  rest.get('/api/events', (req, res, ctx) => {
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
          price: 50
        }
      ])
    );
  }),

  rest.get('/api/events/:id', (req, res, ctx) => {
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
        organizer: 'Test Organizer',
        bookings: []
      })
    );
  }),

  // Bookings handlers
  rest.post('/api/bookings', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        message: 'Booking successful'
      })
    );
  })
];

module.exports = { handlers };
