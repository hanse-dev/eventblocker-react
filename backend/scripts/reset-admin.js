import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminUser() {
  try {
    // Delete existing admin users
    await prisma.user.deleteMany({
      where: { role: 'ADMIN' }
    });

    console.log('Deleted existing admin users');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN'
      }
    });

    console.log('New admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error resetting admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminUser();
