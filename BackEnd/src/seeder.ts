import mongoose from 'mongoose';
import { User, UserSchema } from './database/schemas.js';

const accounts = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '0000000001',
    role: 'ADMIN',
  },
  {
    name: 'Staff User',
    email: 'staff@example.com',
    password: 'admin123',
    phone: '0000000002',
    role: 'EMPLOYEE',
  },
] as const;

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI must be set in the environment or .env file.');

  await mongoose.connect(uri);
  const users = mongoose.model(User.name, UserSchema);

  try {
    for (const account of accounts) {
      const existing = await users.exists({ email: account.email });
      if (existing) {
        console.log(`Account already exists: ${account.email}`);
        continue;
      }

      await users.create(account);
      console.log(`Created ${account.role} account: ${account.email}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error('Failed to seed accounts:', error);
  process.exitCode = 1;
});
