const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.test' });

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clear the database before each test
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Disconnect Prisma after all tests
  await prisma.$disconnect();
});
