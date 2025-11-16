import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedPermissions() {
  const permissions = [
    // ユーザー管理
    { resource: 'user', action: 'list' },
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'grant_admin' },
    // 記事
    { resource: 'article', action: 'list' },
    { resource: 'article', action: 'mark_read' },
    { resource: 'article', action: 'mark_unread' },
    // プライバシーポリシー
    { resource: 'privacy_policy', action: 'list' },
    { resource: 'privacy_policy', action: 'read' },
    { resource: 'privacy_policy', action: 'create' },
    { resource: 'privacy_policy', action: 'update' },
    { resource: 'privacy_policy', action: 'delete' },
    { resource: 'privacy_policy', action: 'clone' },
    { resource: 'privacy_policy', action: 'activate' },
    // ロール管理
    { resource: 'role', action: 'list' },
    { resource: 'role', action: 'read' },
    { resource: 'role', action: 'create' },
    { resource: 'role', action: 'update' },
    { resource: 'role', action: 'delete' },
    { resource: 'role', action: 'assign' },
    { resource: 'role', action: 'revoke' },
    // パーミッション管理
    { resource: 'permission', action: 'list' },
    { resource: 'permission', action: 'read' },
    { resource: 'permission', action: 'create' },
    { resource: 'permission', action: 'delete' },
    // エンドポイント管理
    { resource: 'endpoint', action: 'list' },
    { resource: 'endpoint', action: 'read' },
    { resource: 'endpoint', action: 'create' },
    { resource: 'endpoint', action: 'delete' },
    { resource: 'endpoint', action: 'update' },
  ]

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  })
}

async function seedRoles() {
  await prisma.role.createMany({
    data: [
      { displayName: 'スーパー管理者', description: 'すべての権限を持つ最高管理者' },
      { displayName: '管理者', description: 'ユーザー管理・ポリシー管理が可能' },
      { displayName: '一般ユーザー', description: '基本的な機能が利用可能' },
    ],
    skipDuplicates: true,
  })
}

async function seedRolePermissions() {
  // スーパー管理者：すべての権限
  const superAdmin = await prisma.role.findFirst({ where: { displayName: 'スーパー管理者' } })
  const allPermissions = await prisma.permission.findMany()
  if (superAdmin) {
    await prisma.rolePermission.createMany({
      data: allPermissions.map((p) => ({
        roleId: superAdmin.roleId,
        permissionId: p.permissionId,
      })),
      skipDuplicates: true,
    })
  }

  // 管理者：特定の権限
  const admin = await prisma.role.findFirst({ where: { displayName: '管理者' } })
  const adminPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'user', action: { in: ['list', 'read', 'grant_admin'] } },
        { resource: 'article', action: { in: ['list', 'mark_read', 'mark_unread'] } },
        {
          resource: 'privacy_policy',
          action: { in: ['list', 'read', 'create', 'update', 'delete', 'clone', 'activate'] },
        },
        {
          resource: 'role',
          action: { in: ['list', 'read', 'create', 'update', 'delete', 'assign', 'revoke'] },
        },
        { resource: 'permission', action: { in: ['list', 'read', 'create', 'delete'] } },
        { resource: 'endpoint', action: { in: ['list', 'read', 'create', 'delete', 'update'] } },
      ],
    },
  })
  if (admin) {
    await prisma.rolePermission.createMany({
      data: adminPermissions.map((p) => ({
        roleId: admin.roleId,
        permissionId: p.permissionId,
      })),
      skipDuplicates: true,
    })
  }

  // 一般ユーザー：基本的な権限
  const regularUser = await prisma.role.findFirst({ where: { displayName: '一般ユーザー' } })
  const regularPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'user', action: 'read' },
        { resource: 'article', action: { in: ['list', 'mark_read', 'mark_unread'] } },
        { resource: 'privacy_policy', action: { in: ['list', 'read'] } },
      ],
    },
  })
  if (regularUser) {
    await prisma.rolePermission.createMany({
      data: regularPermissions.map((p) => ({
        roleId: regularUser.roleId,
        permissionId: p.permissionId,
      })),
      skipDuplicates: true,
    })
  }
}

async function seedEndpoints() {
  const endpoints = [
    // Admin API
    { path: '/api/admin/users', method: 'GET' },
    { path: '/api/admin/users/:id', method: 'POST' },
    // Policy API
    { path: '/api/policies', method: 'GET' },
    { path: '/api/policies', method: 'POST' },
    { path: '/api/policies/:version', method: 'GET' },
    { path: '/api/policies/:version', method: 'PATCH' },
    { path: '/api/policies/:version', method: 'DELETE' },
    { path: '/api/policies/:version/clone', method: 'POST' },
    { path: '/api/policies/:version/activate', method: 'PATCH' },
    // Permission API
    { path: '/api/admin/permissions', method: 'GET' },
    { path: '/api/admin/permissions', method: 'POST' },
    { path: '/api/admin/permissions/:id', method: 'DELETE' },
    // Role API
    { path: '/api/admin/roles', method: 'GET' },
    { path: '/api/admin/roles/:id', method: 'GET' },
    { path: '/api/admin/roles', method: 'POST' },
    { path: '/api/admin/roles/:id', method: 'PATCH' },
    { path: '/api/admin/roles/:id', method: 'DELETE' },
    { path: '/api/admin/roles/:id/permissions', method: 'PATCH' },
    // Endpoint API
    { path: '/api/admin/endpoints', method: 'GET' },
    { path: '/api/admin/endpoints/:id', method: 'GET' },
    { path: '/api/admin/endpoints', method: 'POST' },
    { path: '/api/admin/endpoints/:id', method: 'DELETE' },
    { path: '/api/admin/endpoints/:id/permissions', method: 'PATCH' },
  ]

  await prisma.endpoint.createMany({
    data: endpoints,
    skipDuplicates: true,
  })
}

async function seedEndpointPermissions() {
  const endpointPerms = [
    // GET /api/admin/users: user.list
    { path: '/api/admin/users', method: 'GET', resource: 'user', action: 'list' },
    // POST /api/admin/users/:id: user.grant_admin
    { path: '/api/admin/users/:id', method: 'POST', resource: 'user', action: 'grant_admin' },
    // Policy API
    { path: '/api/policies', method: 'GET', resource: 'privacy_policy', action: 'list' },
    { path: '/api/policies', method: 'POST', resource: 'privacy_policy', action: 'create' },
    { path: '/api/policies/:version', method: 'GET', resource: 'privacy_policy', action: 'read' },
    {
      path: '/api/policies/:version',
      method: 'PATCH',
      resource: 'privacy_policy',
      action: 'update',
    },
    {
      path: '/api/policies/:version',
      method: 'DELETE',
      resource: 'privacy_policy',
      action: 'delete',
    },
    {
      path: '/api/policies/:version/clone',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'clone',
    },
    {
      path: '/api/policies/:version/activate',
      method: 'PATCH',
      resource: 'privacy_policy',
      action: 'activate',
    },
    // Permission API
    { path: '/api/admin/permissions', method: 'GET', resource: 'permission', action: 'list' },
    { path: '/api/admin/permissions', method: 'POST', resource: 'permission', action: 'create' },
    {
      path: '/api/admin/permissions/:id',
      method: 'DELETE',
      resource: 'permission',
      action: 'delete',
    },
    // Role API
    { path: '/api/admin/roles', method: 'GET', resource: 'role', action: 'list' },
    { path: '/api/admin/roles/:id', method: 'GET', resource: 'role', action: 'read' },
    { path: '/api/admin/roles', method: 'POST', resource: 'role', action: 'create' },
    { path: '/api/admin/roles/:id', method: 'PATCH', resource: 'role', action: 'update' },
    { path: '/api/admin/roles/:id', method: 'DELETE', resource: 'role', action: 'delete' },
    {
      path: '/api/admin/roles/:id/permissions',
      method: 'PATCH',
      resource: 'role',
      action: 'update',
    },
    // Endpoint API
    { path: '/api/admin/endpoints', method: 'GET', resource: 'endpoint', action: 'list' },
    { path: '/api/admin/endpoints/:id', method: 'GET', resource: 'endpoint', action: 'read' },
    { path: '/api/admin/endpoints', method: 'POST', resource: 'endpoint', action: 'create' },
    {
      path: '/api/admin/endpoints/:id',
      method: 'DELETE',
      resource: 'endpoint',
      action: 'delete',
    },
    {
      path: '/api/admin/endpoints/:id/permissions',
      method: 'PATCH',
      resource: 'endpoint',
      action: 'update',
    },
  ]

  for (const ep of endpointPerms) {
    const endpoint = await prisma.endpoint.findUnique({
      where: {
        path_method: {
          path: ep.path,
          method: ep.method,
        },
      },
    })
    const permission = await prisma.permission.findUnique({
      where: {
        resource_action: {
          resource: ep.resource,
          action: ep.action,
        },
      },
    })

    if (endpoint && permission) {
      await prisma.endpointPermission.upsert({
        where: {
          endpointId_permissionId: {
            endpointId: endpoint.endpointId,
            permissionId: permission.permissionId,
          },
        },
        create: {
          endpointId: endpoint.endpointId,
          permissionId: permission.permissionId,
        },
        update: {},
      })
    }
  }
}

async function main() {
  // 権限システムのシードデータ
  await seedPermissions()
  await seedRoles()
  await seedRolePermissions()
  await seedEndpoints()
  await seedEndpointPermissions()

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
    // 既存ユーザーに「管理者」ロールを割り当て
    const adminRole = await prisma.role.findFirst({
      where: { displayName: '管理者' },
    })
    if (adminRole) {
      await prisma.userRole.upsert({
        where: {
          activeUserId_roleId: {
            activeUserId: existingUser.activeUserId,
            roleId: adminRole.roleId,
          },
        },
        create: {
          activeUserId: existingUser.activeUserId,
          roleId: adminRole.roleId,
        },
        update: {},
      })
    }
    return
  }

  // トランザクションで初期Adminユーザーを作成
  const result = await prisma.$transaction(async (tx) => {
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
        activeUserId: activeUser.activeUserId,
        grantedByAdminUserId: 1, // 初期Adminは自分自身が付与者
      },
    })

    return {
      user,
      activeUser,
      adminUser,
    }
  })

  // 初期Adminユーザーに「管理者」ロールを割り当て
  const adminRole = await prisma.role.findFirst({
    where: { displayName: '管理者' },
  })
  if (adminRole) {
    await prisma.userRole.create({
      data: {
        activeUserId: result.activeUser.activeUserId,
        roleId: adminRole.roleId,
      },
    })
  }
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
