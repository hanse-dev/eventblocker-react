const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

let userToken;
let adminToken;
let testEvent;
let testUser;
let testAdmin;

beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await prisma.user.create({
        data: {
            email: 'testuser@test.com',
            password: hashedPassword,
            name: 'Test User',
            role: 'USER'
        }
    });

    // Create test admin
    testAdmin = await prisma.user.create({
        data: {
            email: 'testadmin@test.com',
            password: hashedPassword,
            name: 'Test Admin',
            role: 'ADMIN'
        }
    });

    // Get tokens
    const userResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@test.com', password: 'password123' });
    userToken = userResponse.body.token;

    const adminResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testadmin@test.com', password: 'password123' });
    adminToken = adminResponse.body.token;

    // Create test event
    testEvent = await prisma.event.create({
        data: {
            title: 'Test Event',
            description: 'Test Description',
            date: new Date('2024-12-31'),
            location: 'Test Location',
            capacity: 2,
            price: 10.00,
            userId: testAdmin.id
        }
    });
});

afterEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
});

describe('Booking Endpoints', () => {
    describe('POST /api/bookings', () => {
        it('should create a new booking', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ eventId: testEvent.id });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.eventId).toBe(testEvent.id);
            expect(res.body.userId).toBe(testUser.id);
            expect(res.body.status).toBe('CONFIRMED');
        });

        it('should prevent booking when event is full', async () => {
            // Create two bookings to reach capacity
            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ eventId: testEvent.id });

            const anotherUser = await prisma.user.create({
                data: {
                    email: 'another@test.com',
                    password: await bcrypt.hash('password123', 10),
                    name: 'Another User',
                    role: 'USER'
                }
            });

            const anotherToken = (await request(app)
                .post('/api/auth/login')
                .send({ email: 'another@test.com', password: 'password123' })).body.token;

            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${anotherToken}`)
                .send({ eventId: testEvent.id });

            // Try to book when event is full
            const thirdUser = await prisma.user.create({
                data: {
                    email: 'third@test.com',
                    password: await bcrypt.hash('password123', 10),
                    name: 'Third User',
                    role: 'USER'
                }
            });

            const thirdToken = (await request(app)
                .post('/api/auth/login')
                .send({ email: 'third@test.com', password: 'password123' })).body.token;

            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${thirdToken}`)
                .send({ eventId: testEvent.id });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Event is fully booked');
        });
    });

    describe('GET /api/bookings/user', () => {
        it('should get user bookings', async () => {
            // Create a booking first
            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ eventId: testEvent.id });

            const res = await request(app)
                .get('/api/bookings/user')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
            expect(res.body[0].eventId).toBe(testEvent.id);
        });
    });

    describe('GET /api/bookings/event/:id', () => {
        it('should allow admin to view event bookings', async () => {
            // Create a booking first
            await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ eventId: testEvent.id });

            const res = await request(app)
                .get(`/api/bookings/event/${testEvent.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
            expect(res.body[0].eventId).toBe(testEvent.id);
        });

        it('should not allow regular user to view event bookings', async () => {
            const res = await request(app)
                .get(`/api/bookings/event/${testEvent.id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/bookings/:id', () => {
        it('should allow user to update their booking status', async () => {
            // Create a booking first
            const booking = await prisma.booking.create({
                data: {
                    userId: testUser.id,
                    eventId: testEvent.id,
                    status: 'CONFIRMED'
                }
            });

            const res = await request(app)
                .put(`/api/bookings/${booking.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'CANCELLED' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('CANCELLED');
        });

        it('should not allow user to update other users booking', async () => {
            // Create a booking for another user
            const anotherUser = await prisma.user.create({
                data: {
                    email: 'another@test.com',
                    password: await bcrypt.hash('password123', 10),
                    name: 'Another User',
                    role: 'USER'
                }
            });

            const booking = await prisma.booking.create({
                data: {
                    userId: anotherUser.id,
                    eventId: testEvent.id,
                    status: 'CONFIRMED'
                }
            });

            const res = await request(app)
                .put(`/api/bookings/${booking.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'CANCELLED' });

            expect(res.statusCode).toBe(403);
        });
    });
});
