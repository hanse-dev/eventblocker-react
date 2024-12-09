const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'test.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Clean up database before all tests
beforeAll(async () => {
  await prisma.$transaction([
    prisma.booking.deleteMany(),
    prisma.event.deleteMany(),
    prisma.user.deleteMany()
  ]);
});

// Clean up database before each test
beforeEach(async () => {
  await prisma.$transaction([
    prisma.booking.deleteMany(),
    prisma.event.deleteMany(),
    prisma.user.deleteMany()
  ]);
});

// Clean up and disconnect after all tests
afterAll(async () => {
  await prisma.$transaction([
    prisma.booking.deleteMany(),
    prisma.event.deleteMany(),
    prisma.user.deleteMany()
  ]);
  await prisma.$disconnect();
});
