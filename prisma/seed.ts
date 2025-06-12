import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // テスト用のアカウントとユーザーを作成
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // 既存のテストアカウントを確認
  const existingAccount = await prisma.account.findUnique({
    where: { email: testEmail },
  });

  if (existingAccount) {
    console.log(`Test account already exists: ${testEmail}`);
    return;
  }

  // アカウントを作成
  const account = await prisma.account.create({
    data: {
      email: testEmail,
      password: hashedPassword,
      lastLogin: new Date(),
    },
  });

  // ユーザーを作成
  await prisma.user.create({
    data: {
      accountId: account.accountId,
      displayName: 'テストユーザー',
    },
  });

  console.log(`Created test account: ${testEmail} with password: ${testPassword}`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });