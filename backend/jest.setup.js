const { prisma } = require('./server');

beforeEach(async () => {
  // Clear the database before each test
  await prisma.example.deleteMany();
});

afterAll(async () => {
  // Disconnect Prisma after all tests
  await prisma.$disconnect();
});
