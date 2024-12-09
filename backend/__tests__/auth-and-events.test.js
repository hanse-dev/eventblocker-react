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

  // Clean up the database before tests
  beforeAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
  });

  // Clean up after tests
  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
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
    });

    test('should not create second admin', async () => {
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
    });

    test('should login as admin', async () => {
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
    test('admin should create event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Event',
          description: 'Test Description',
          date: '2024-12-20T18:00:00.000Z',
          location: 'Test Location',
          capacity: 100,
          price: 29.99
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Event');
      eventId = res.body.id;
    });

    test('regular user should not create event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User Event',
          description: 'Test Description',
          date: '2024-12-20T18:00:00.000Z',
          location: 'Test Location',
          capacity: 100,
          price: 29.99
        });

      expect(res.statusCode).toBe(403);
    });

    test('should get all events', async () => {
      const res = await request(app)
        .get('/api/events');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
    });

    test('should get single event', async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', eventId);
    });

    test('admin should update event', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Event',
          description: 'Updated Description',
          date: '2024-12-21T18:00:00.000Z',
          location: 'Updated Location',
          capacity: 150,
          price: 39.99
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Event');
    });

    test('regular user should not update event', async () => {
      const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User Updated Event'
        });

      expect(res.statusCode).toBe(403);
    });

    test('admin should delete event', async () => {
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
