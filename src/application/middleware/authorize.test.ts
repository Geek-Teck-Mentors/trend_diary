import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { resultError, resultSuccess } from '@yuukihayashi0510/core'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { logger } from '@/common/logger'
import { createPermissionUseCase } from '@/domain/permission'
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

  it('権限がある場合、次のハンドラーに進む', async () => {
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

    app.get('/test', authorize('article', 'read'), (c) => c.json({ ok: true }))

    // ユーザーロールを取得するモック
    mockDb.userRole.findMany.mockResolvedValue([
      {
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      },
    ])

    // ロールパーミッションを取得するモック
    const mockRolePermissionWithPermission: Prisma.RolePermissionGetPayload<{
      include: { permission: true }
    }>[] = [
      {
        roleId: 1,
        permissionId: 1,
        permission: {
          permissionId: 1,
          resource: 'article',
          action: 'read',
        },
      },
    ]
    mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

    const res = await app.request('/test')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('権限がない場合、403エラーを返す', async () => {
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

    app.get('/test', authorize('article', 'delete'), (c) => c.json({ ok: true }))

    // ユーザーロールを取得するモック
    mockDb.userRole.findMany.mockResolvedValue([
      {
        activeUserId: BigInt(1),
        roleId: 1,
        grantedAt: new Date(),
      },
    ])

    // ロールパーミッション（deleteはない）
    const mockRolePermissionWithPermission: Prisma.RolePermissionGetPayload<{
      include: { permission: true }
    }>[] = [
      {
        roleId: 1,
        permissionId: 1,
        permission: {
          permissionId: 1,
          resource: 'article',
          action: 'read',
        },
      },
    ]
    mockDb.rolePermission.findMany.mockResolvedValue(mockRolePermissionWithPermission)

    const res = await app.request('/test')

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ message: 'Permission denied' })
  })

  it('SESSION_USERが設定されていない場合、401エラーを返す', async () => {
    app.get('/test', authorize('article', 'read'), (c) => c.json({ ok: true }))

    const res = await app.request('/test')

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

    app.get('/test', authorize('article', 'read'), (c) => c.json({ ok: true }))

    // DBエラーをシミュレート
    mockDb.userRole.findMany.mockRejectedValue(new Error('DB Error'))

    const res = await app.request('/test')

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ message: 'Internal Server Error' })
  })
})
