import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * パーミッションのシードデータを投入
 */
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

/**
 * ロールのシードデータを投入
 */
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

/**
 * ロール-パーミッションのシードデータを投入
 */
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

  // 一般ユーザー：基本的な権限のみ
  const regularUser = await prisma.role.findFirst({ where: { displayName: '一般ユーザー' } })
  const regularPermissions = await prisma.permission.findMany({
    where: {
      OR: [
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

/**
 * エンドポイントのシードデータを投入
 */
async function seedEndpoints() {
  const endpoints = [
    // ユーザー管理
    { path: '/api/admin/users', method: 'GET', resource: 'user', action: 'list' },
    { path: '/api/admin/users/:id', method: 'POST', resource: 'user', action: 'grant_admin' },
    // 記事
    { path: '/api/articles', method: 'GET', resource: 'article', action: 'list' },
    { path: '/api/articles/:id/read', method: 'POST', resource: 'article', action: 'mark_read' },
    {
      path: '/api/articles/:id/read',
      method: 'DELETE',
      resource: 'article',
      action: 'mark_unread',
    },
    // プライバシーポリシー
    {
      path: '/api/admin/privacy-policies',
      method: 'GET',
      resource: 'privacy_policy',
      action: 'list',
    },
    {
      path: '/api/admin/privacy-policies/:id',
      method: 'GET',
      resource: 'privacy_policy',
      action: 'read',
    },
    {
      path: '/api/admin/privacy-policies',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'create',
    },
    {
      path: '/api/admin/privacy-policies/:id',
      method: 'PUT',
      resource: 'privacy_policy',
      action: 'update',
    },
    {
      path: '/api/admin/privacy-policies/:id',
      method: 'DELETE',
      resource: 'privacy_policy',
      action: 'delete',
    },
    {
      path: '/api/admin/privacy-policies/:id/clone',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'clone',
    },
    {
      path: '/api/admin/privacy-policies/:id/activate',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'activate',
    },
    // ロール管理
    { path: '/api/admin/roles', method: 'GET', resource: 'role', action: 'list' },
    { path: '/api/admin/roles/:id', method: 'GET', resource: 'role', action: 'read' },
    { path: '/api/admin/roles', method: 'POST', resource: 'role', action: 'create' },
    { path: '/api/admin/roles/:id', method: 'PUT', resource: 'role', action: 'update' },
    { path: '/api/admin/roles/:id', method: 'DELETE', resource: 'role', action: 'delete' },
    // パーミッション管理
    { path: '/api/admin/permissions', method: 'GET', resource: 'permission', action: 'list' },
    { path: '/api/admin/permissions/:id', method: 'GET', resource: 'permission', action: 'read' },
    { path: '/api/admin/permissions', method: 'POST', resource: 'permission', action: 'create' },
    {
      path: '/api/admin/permissions/:id',
      method: 'DELETE',
      resource: 'permission',
      action: 'delete',
    },
    // エンドポイント管理
    { path: '/api/admin/endpoints', method: 'GET', resource: 'endpoint', action: 'list' },
    { path: '/api/admin/endpoints/:id', method: 'GET', resource: 'endpoint', action: 'read' },
    { path: '/api/admin/endpoints', method: 'POST', resource: 'endpoint', action: 'create' },
    { path: '/api/admin/endpoints/:id', method: 'DELETE', resource: 'endpoint', action: 'delete' },
    { path: '/api/admin/endpoints/:id', method: 'PUT', resource: 'endpoint', action: 'update' },
  ]

  await prisma.endpoint.createMany({
    data: endpoints,
    skipDuplicates: true,
  })
}

/**
 * エンドポイント-パーミッションのシードデータを投入
 */
async function seedEndpointPermissions() {
  const endpointsData = [
    // ユーザー管理
    { path: '/api/admin/users', method: 'GET', resource: 'user', action: 'list' },
    { path: '/api/admin/users/:id', method: 'POST', resource: 'user', action: 'grant_admin' },
    // 記事
    { path: '/api/articles', method: 'GET', resource: 'article', action: 'list' },
    { path: '/api/articles/:id/read', method: 'POST', resource: 'article', action: 'mark_read' },
    {
      path: '/api/articles/:id/read',
      method: 'DELETE',
      resource: 'article',
      action: 'mark_unread',
    },
    // プライバシーポリシー
    {
      path: '/api/admin/privacy-policies',
      method: 'GET',
      resource: 'privacy_policy',
      action: 'list',
    },
    {
      path: '/api/admin/privacy-policies/:id',
      method: 'GET',
      resource: 'privacy_policy',
      action: 'read',
    },
    {
      path: '/api/admin/privacy-policies',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'create',
    },
    {
      path: '/api/admin/privacy-policies/:id',
      method: 'PUT',
      resource: 'privacy_policy',
      action: 'update',
    },
    {
      path: '/api/admin/privacy-policies/:id',
      method: 'DELETE',
      resource: 'privacy_policy',
      action: 'delete',
    },
    {
      path: '/api/admin/privacy-policies/:id/clone',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'clone',
    },
    {
      path: '/api/admin/privacy-policies/:id/activate',
      method: 'POST',
      resource: 'privacy_policy',
      action: 'activate',
    },
    // ロール管理
    { path: '/api/admin/roles', method: 'GET', resource: 'role', action: 'list' },
    { path: '/api/admin/roles/:id', method: 'GET', resource: 'role', action: 'read' },
    { path: '/api/admin/roles', method: 'POST', resource: 'role', action: 'create' },
    { path: '/api/admin/roles/:id', method: 'PUT', resource: 'role', action: 'update' },
    { path: '/api/admin/roles/:id', method: 'DELETE', resource: 'role', action: 'delete' },
    // パーミッション管理
    { path: '/api/admin/permissions', method: 'GET', resource: 'permission', action: 'list' },
    { path: '/api/admin/permissions/:id', method: 'GET', resource: 'permission', action: 'read' },
    { path: '/api/admin/permissions', method: 'POST', resource: 'permission', action: 'create' },
    {
      path: '/api/admin/permissions/:id',
      method: 'DELETE',
      resource: 'permission',
      action: 'delete',
    },
    // エンドポイント管理
    { path: '/api/admin/endpoints', method: 'GET', resource: 'endpoint', action: 'list' },
    { path: '/api/admin/endpoints/:id', method: 'GET', resource: 'endpoint', action: 'read' },
    { path: '/api/admin/endpoints', method: 'POST', resource: 'endpoint', action: 'create' },
    { path: '/api/admin/endpoints/:id', method: 'DELETE', resource: 'endpoint', action: 'delete' },
    { path: '/api/admin/endpoints/:id', method: 'PUT', resource: 'endpoint', action: 'update' },
  ]

  for (const ep of endpointsData) {
    const endpoint = await prisma.endpoint.findFirst({
      where: {
        path: ep.path,
        method: ep.method,
      },
    })

    const permission = await prisma.permission.findFirst({
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

/**
 * API test用のグローバルセットアップ
 * テストDB用のシードデータを投入
 */
export default async function setup() {
  // biome-ignore lint/suspicious/noConsole: test setup logging
  console.log('Running API test setup: seeding test database...')

  try {
    await seedPermissions()
    await seedRoles()
    await seedRolePermissions()
    await seedEndpoints()
    await seedEndpointPermissions()

    // biome-ignore lint/suspicious/noConsole: test setup logging
    console.log('API test setup completed successfully')
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: test setup error logging
    console.error('Failed to setup API test environment:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
