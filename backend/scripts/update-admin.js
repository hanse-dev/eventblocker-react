import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
      return;
    }

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.error('No admin user found');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        email: email
      }
    });

    console.log('Admin user updated successfully:', updatedAdmin.email);
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
