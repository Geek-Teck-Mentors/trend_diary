import { PrismaClient, type Prisma } from '@prisma/client'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { logger } from '@/common/logger'
import type { Env, SessionUser } from '../env'
import CONTEXT_KEY from './context'
import authorize from './authorize'

// モック
vi.mock('@/infrastructure/rdb', () => ({
  default: vi.fn(() => mockDb),
}))

const mockDb = mockDeep<PrismaClient>()

describe('authorize middleware', () => {
  let app: Hono<Env>

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono<Env>()

    // コンテキストに必要な値を設定するミドルウェア
    app.use('*', async (c, next) => {
      c.set(CONTEXT_KEY.APP_LOG, logger)
      c.env = {
        DATABASE_URL: 'postgresql://test',
        DISCORD_WEBHOOK_URL: '',
        FEATURE_USER_ENABLED: 'true',
        SUPABASE_URL: '',
        SUPABASE_ANON_KEY: '',
      }
      await next()
    })
  })

  it('エンドポイントが登録されていない場合、認可をスキップして次のハンドラーに進む', async () => {
    const sessionUser: SessionUser = {
      activeUserId: BigInt(1),
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      adminUserId: null,
    }

    app.use('*', async (c, next) => {
      c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
      await next()
    })

    app.get('/api/test', authorize(), (c) => c.json({ ok: true }))

    // エンドポイントが見つからない場合
    mockDb.endpoint.findUnique.mockResolvedValue(null)

    const res = await app.request('/api/test')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('ユーザーが必要な権限を持つ場合、次のハンドラーに進む', async () => {
    const sessionUser: SessionUser = {
      activeUserId: BigInt(1),
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      adminUserId: null,
    }

    app.use('*', async (c, next) => {
      c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
      await next()
    })

    app.get('/api/articles', authorize(), (c) => c.json({ ok: true }))

    // エンドポイントとその必要権限を取得するモック
    const mockEndpointWithPermissions: Prisma.EndpointGetPayload<{
      include: { endpointPermissions: { include: { permission: true } } }
    }> = {
      endpointId: 1,
      path: '/api/articles',
      method: 'GET',
      createdAt: new Date(),
      endpointPermissions: [
        {
          endpointId: 1,
          permissionId: 1,
          permission: {
            permissionId: 1,
            resource: 'article',
            action: 'list',
          },
        },
      ],
    }
    mockDb.endpoint.findUnique.mockResolvedValue(mockEndpointWithPermissions)

    // ユーザーロールを取得するモック
    mockDb.userRole.findMany.mockResolvedValue([
      {
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      },
    ])

    // ユーザーが持つ権限を取得するモック
    const mockRolePermissionWithPermission: Prisma.RolePermissionGetPayload<{
      include: { permission: true }
    }>[] = [
      {
        roleId: 1,
        permissionId: 1,
        permission: {
          permissionId: 1,
          resource: 'article',
          action: 'list',
        },
      },
    ]
    mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

    const res = await app.request('/api/articles')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('ユーザーが必要な権限を持たない場合、403エラーを返す', async () => {
    const sessionUser: SessionUser = {
      activeUserId: BigInt(1),
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      adminUserId: null,
    }

    app.use('*', async (c, next) => {
      c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
      await next()
    })

    app.delete('/api/articles/1', authorize(), (c) => c.json({ ok: true }))

    // エンドポイントとその必要権限を取得するモック（delete権限が必要）
    const mockEndpointWithPermissions: Prisma.EndpointGetPayload<{
      include: { endpointPermissions: { include: { permission: true } } }
    }> = {
      endpointId: 2,
      path: '/api/articles/:id',
      method: 'DELETE',
      createdAt: new Date(),
      endpointPermissions: [
        {
          endpointId: 2,
          permissionId: 2,
          permission: {
            permissionId: 2,
            resource: 'article',
            action: 'delete',
          },
        },
      ],
    }
    mockDb.endpoint.findUnique.mockResolvedValue(mockEndpointWithPermissions)

    // ユーザーロールを取得するモック
    mockDb.userRole.findMany.mockResolvedValue([
      {
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      },
    ])

    // ユーザーが持つ権限を取得するモック（readのみ）
    const mockRolePermissionWithPermission: Prisma.RolePermissionGetPayload<{
      include: { permission: true }
    }>[] = [
      {
        roleId: 1,
        permissionId: 1,
        permission: {
          permissionId: 1,
          resource: 'article',
          action: 'list',
        },
      },
    ]
    mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

    const res = await app.request('/api/articles/1', { method: 'DELETE' })

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ message: 'Permission denied' })
  })

  it('SESSION_USERが設定されていない場合、401エラーを返す', async () => {
    app.get('/api/test', authorize(), (c) => c.json({ ok: true }))

    const res = await app.request('/api/test')

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'login required' })
  })

  it('データベースエラーの場合、500エラーを返す', async () => {
    const sessionUser: SessionUser = {
      activeUserId: BigInt(1),
      displayName: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      adminUserId: null,
    }

    app.use('*', async (c, next) => {
      c.set(CONTEXT_KEY.SESSION_USER, sessionUser)
      await next()
    })

    app.get('/api/test', authorize(), (c) => c.json({ ok: true }))

    // DBエラーをシミュレート
    mockDb.endpoint.findUnique.mockRejectedValue(new Error('DB Error'))

    const res = await app.request('/api/test')

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ message: 'Internal Server Error' })
  })
})
