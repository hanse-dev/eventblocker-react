const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../test.env') });

const app = require('../server');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

describe('Authentication and Events API', () => {
  let adminToken;
  let userToken;
  let eventId;
  let adminId;
  let userId;

  // Clean up database before each test
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.booking.deleteMany(),
      prisma.event.deleteMany(),
      prisma.user.deleteMany()
    ]);
  });

  describe('Authentication', () => {
    test('should create admin user', async () => {
      const res = await request(app)
        .post('/api/auth/create-admin')
        .send({
          email: 'admin@test.com',
          password: 'adminpass123',
          name: 'Test Admin'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('role', 'ADMIN');
      expect(res.body).toHaveProperty('token');
      adminToken = res.body.token;
      adminId = res.body.user.id;
    });

    test('should not create second admin', async () => {
      // First create an admin
      await request(app)
        .post('/api/auth/create-admin')
        .send({
          email: 'admin1@test.com',
          password: 'adminpass123',
          name: 'Test Admin 1'
        });

      // Try to create second admin
      const res = await request(app)
        .post('/api/auth/create-admin')
        .send({
          email: 'admin2@test.com',
          password: 'adminpass123',
          name: 'Test Admin 2'
        });

      expect(res.statusCode).toBe(400);
    });

    test('should register regular user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'userpass123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('role', 'USER');
      expect(res.body).toHaveProperty('token');
      userToken = res.body.token;
      userId = res.body.user.id;
    });

    test('should login as admin', async () => {
      // First create an admin
      const createRes = await request(app)
        .post('/api/auth/create-admin')
        .send({
          email: 'admin@test.com',
          password: 'adminpass123',
          name: 'Test Admin'
        });
      
      adminId = createRes.body.user.id;

      // Then try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'adminpass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('role', 'ADMIN');
      expect(res.body).toHaveProperty('token');
      adminToken = res.body.token;
    });

    test('should login as user', async () => {
      // First create a user
      const createRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'userpass123',
          name: 'Test User'
        });
      
      userId = createRes.body.user.id;

      // Then try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'userpass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('role', 'USER');
      expect(res.body).toHaveProperty('token');
      userToken = res.body.token;
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      // Create admin user for events tests
      const createRes = await request(app)
        .post('/api/auth/create-admin')
        .send({
          email: 'admin@test.com',
          password: 'adminpass123',
          name: 'Test Admin'
        });
      
      adminId = createRes.body.user.id;
      adminToken = createRes.body.token;

      // Create regular user
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'userpass123',
          name: 'Test User'
        });
      
      userId = userRes.body.user.id;
      userToken = userRes.body.token;
    });

    test('admin should create event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', eventData.title);
      expect(res.body).toHaveProperty('userId', adminId);
      eventId = res.body.id;
    });

    test('regular user should not create event', async () => {
      const eventData = {
        title: 'User Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(eventData);

      expect(res.statusCode).toBe(403);
    });

    test('should get all events', async () => {
      // First create an event
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData);

      eventId = createRes.body.id;

      // Then get all events
      const res = await request(app)
        .get('/api/events');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('id', eventId);
    });

    test('should get single event', async () => {
      // First create an event
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData);

      eventId = createRes.body.id;

      // Then get the event
      const res = await request(app)
        .get(`/api/events/${eventId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', eventId);
      expect(res.body).toHaveProperty('createdBy');
      expect(res.body.createdBy).toHaveProperty('id', adminId);
    });

    test('admin should update event', async () => {
      // First create an event
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData);

      eventId = createRes.body.id;

      // Then update it
      const updateData = {
        title: 'Updated Event',
        description: 'Updated Description',
        date: '2024-12-21T18:00:00.000Z',
        location: 'Updated Location',
        capacity: 150,
        price: 39.99
      };

      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', updateData.title);
    });

    test('regular user should not update event', async () => {
      // First create an event as admin
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData);

      eventId = createRes.body.id;

      // Then try to update it as regular user
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User Updated Event'
        });

      expect(res.statusCode).toBe(403);
    });

    test('admin should delete event', async () => {
      // First create an event
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-20T18:00:00.000Z',
        location: 'Test Location',
        capacity: 100,
        price: 29.99
      };

      const createRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData);

      eventId = createRes.body.id;

      // Then delete it
      const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      // Verify event is deleted
      const getRes = await request(app)
        .get(`/api/events/${eventId}`);
      expect(getRes.statusCode).toBe(404);
    });
  });
});
