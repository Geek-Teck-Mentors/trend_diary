import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 初期Adminユーザーの情報
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const adminDisplayName = 'System Administrator'

  // パスワードハッシュ化
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // 既存のAdminユーザーをチェック
  const existingUser = await prisma.activeUser.findUnique({
    where: { email: adminEmail },
    include: { adminUser: true },
  })

  if (existingUser?.adminUser) {
    return
  }

  // トランザクションで初期Adminユーザーを作成
  const _result = await prisma.$transaction(async (tx) => {
    // 1. Userレコード作成
    const user = await tx.user.create({
      data: {},
    })

    // 2. ActiveUserレコード作成
    const activeUser = await tx.activeUser.create({
      data: {
        userId: user.userId,
        email: adminEmail,
        password: hashedPassword,
        displayName: adminDisplayName,
      },
    })

    // 3. AdminUserレコード作成（grantedByAdminUserIdは自分自身を参照）
    const adminUser = await tx.adminUser.create({
      data: {
        ActiveUserId: activeUser.activeUserId,
        grantedByAdminUserId: 1, // 初期Adminは自分自身が付与者
      },
    })

    return {
      user,
      activeUser,
      adminUser,
    }
  })
}

main()
  .catch((e) => {
    // biome-ignore lint/suspicious/noConsole: cli command console
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
