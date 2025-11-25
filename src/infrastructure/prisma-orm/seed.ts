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
  const presetRoles = [
    { displayName: 'スーパー管理者', description: 'すべての権限を持つ最高管理者' },
    { displayName: '管理者', description: 'ユーザー管理・ポリシー管理が可能' },
    { displayName: '一般ユーザー', description: '基本的な機能が利用可能' },
  ]

  // 既存のプリセットロールを一度に取得
  const existingRoles = await prisma.role.findMany({
    where: {
      displayName: { in: presetRoles.map((r) => r.displayName) },
      preset: true,
    },
    select: { displayName: true },
  })

  const existingRoleNames = new Set(existingRoles.map((r) => r.displayName))

  // 不足しているロールをフィルタリング
  const rolesToCreate = presetRoles
    .filter((role) => !existingRoleNames.has(role.displayName))
    .map((role) => ({ ...role, preset: true }))

  // まとめて作成
  if (rolesToCreate.length > 0) {
    await prisma.role.createMany({
      data: rolesToCreate,
    })
  }
}

async function seedRolePermissions() {
  // スーパー管理者：すべての権限
  const superAdmin = await prisma.role.findFirst({
    where: { preset: true, displayName: 'スーパー管理者' },
  })
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
  const admin = await prisma.role.findFirst({ where: { preset: true, displayName: '管理者' } })
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
  const regularUser = await prisma.role.findFirst({
    where: { preset: true, displayName: '一般ユーザー' },
  })
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
    { path: '/api/permissions', method: 'GET' },
    { path: '/api/permissions', method: 'POST' },
    { path: '/api/permissions/:id', method: 'DELETE' },
    // Role API
    { path: '/api/roles', method: 'GET' },
    { path: '/api/roles/:id', method: 'GET' },
    { path: '/api/roles', method: 'POST' },
    { path: '/api/roles/:id', method: 'PATCH' },
    { path: '/api/roles/:id', method: 'DELETE' },
    { path: '/api/roles/:id/permissions', method: 'PATCH' },
    // Endpoint API
    { path: '/api/endpoints', method: 'GET' },
    { path: '/api/endpoints/:id', method: 'GET' },
    { path: '/api/endpoints', method: 'POST' },
    { path: '/api/endpoints/:id', method: 'DELETE' },
    { path: '/api/endpoints/:id/permissions', method: 'PATCH' },
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
    { path: '/api/permissions', method: 'GET', resource: 'permission', action: 'list' },
    { path: '/api/permissions', method: 'POST', resource: 'permission', action: 'create' },
    {
      path: '/api/permissions/:id',
      method: 'DELETE',
      resource: 'permission',
      action: 'delete',
    },
    // Role API
    { path: '/api/roles', method: 'GET', resource: 'role', action: 'list' },
    { path: '/api/roles/:id', method: 'GET', resource: 'role', action: 'read' },
    { path: '/api/roles', method: 'POST', resource: 'role', action: 'create' },
    { path: '/api/roles/:id', method: 'PATCH', resource: 'role', action: 'update' },
    { path: '/api/roles/:id', method: 'DELETE', resource: 'role', action: 'delete' },
    {
      path: '/api/roles/:id/permissions',
      method: 'PATCH',
      resource: 'role',
      action: 'update',
    },
    // Endpoint API
    { path: '/api/endpoints', method: 'GET', resource: 'endpoint', action: 'list' },
    { path: '/api/endpoints/:id', method: 'GET', resource: 'endpoint', action: 'read' },
    { path: '/api/endpoints', method: 'POST', resource: 'endpoint', action: 'create' },
    {
      path: '/api/endpoints/:id',
      method: 'DELETE',
      resource: 'endpoint',
      action: 'delete',
    },
    {
      path: '/api/endpoints/:id/permissions',
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
          // biome-ignore lint/style/useNamingConvention: Prisma composite unique key name
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

async function seedAdminUser() {
  // 初期Adminユーザーの情報
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const adminDisplayName = 'System Administrator'

  // パスワードハッシュ化
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // 管理者ロールを取得
  const adminRole = await prisma.role.findFirst({
    where: { preset: true, displayName: '管理者' },
  })
  if (!adminRole) {
    throw new Error('管理者ロールが見つかりません')
  }

  // 既存のAdminユーザーをチェック
  const existingUser = await prisma.activeUser.findUnique({
    where: { email: adminEmail },
    include: {
      userRoles: {
        where: { roleId: adminRole.roleId },
      },
    },
  })

  if (existingUser && existingUser.userRoles.length > 0) {
    // 既にAdmin権限を持っている
    return
  }

  if (existingUser) {
    // ユーザーは存在するが管理者ロールを持っていない
    await prisma.userRole.create({
      data: {
        activeUserId: existingUser.activeUserId,
        roleId: adminRole.roleId,
        grantedByActiveUserId: existingUser.activeUserId, // 初期シードなので自分自身
      },
    })
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

    // 3. 管理者ロールを割り当て
    await tx.userRole.create({
      data: {
        activeUserId: activeUser.activeUserId,
        roleId: adminRole.roleId,
        grantedByActiveUserId: activeUser.activeUserId, // 初期Adminは自分自身が付与者
      },
    })

    return {
      user,
      activeUser,
    }
  })
}

async function main() {
  // 権限システムのシードデータ
  await seedPermissions()
  await seedRoles()
  await seedRolePermissions()
  await seedEndpoints()
  await seedEndpointPermissions()
  await seedAdminUser()
}

// Vitest globalSetup & CLI実行の両方に対応
export default async function setup() {
  try {
    await main()
  } finally {
    await prisma.$disconnect()
  }
}

// CLIから直接実行される場合（ES Modules形式）
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  setup().catch((e) => {
    // biome-ignore lint/suspicious/noConsole: cli command console
    console.error('Error seeding database:', e)
    process.exit(1)
  })
}
