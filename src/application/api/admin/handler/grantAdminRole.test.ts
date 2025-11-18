import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import adminUserTestHelper from '@/test/helper/adminUserTestHelper'
import { GrantAdminRoleResponse } from './grantAdminRole'

async function requestPostAdminUser(id: string, sessionId?: string) {
  const url = `/api/admin/users/${id}`
  const headers = sessionId ? { Cookie: `sid=${sessionId}` } : undefined
  return app.request(url, { method: 'POST', headers }, TEST_ENV)
}

describe('POST /api/admin/users/:id', () => {
  beforeEach(async () => {
    await activeUserTestHelper.cleanUp()
    await adminUserTestHelper.cleanUp()
  })

  afterEach(async () => {
    await activeUserTestHelper.cleanUp()
    await adminUserTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('Admin権限を持つユーザーが他のユーザーにAdmin権限を付与できる', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 通常ユーザーを作成
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
        'Regular User',
      )

      // Admin権限を付与
      const res = await requestPostAdminUser(
        regularUser.activeUserId.toString(),
        adminUser.sessionId,
      )

      expect(res.status).toBe(200)
      const data = await res.json<GrantAdminRoleResponse>()
      expect(data.activeUserId).toBe(regularUser.activeUserId.toString())
      expect(data.adminUserId).toBeDefined()
      expect(data.grantedAt).toBeDefined()
      expect(data.grantedByAdminUserId).toBe(Number(adminUser.activeUserId))

      // 実際にAdmin権限が付与されたか確認（UserRoleテーブルをチェック）
      const rdb = adminUserTestHelper.getRdb()
      const adminRole = await rdb.role.findFirst({
        where: { displayName: '管理者' },
      })
      const userRole = await rdb.userRole.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma composite unique key name
          activeUserId_roleId: {
            activeUserId: regularUser.activeUserId,
            roleId: adminRole!.roleId,
          },
        },
      })
      expect(userRole).not.toBeNull()
      expect(userRole?.activeUserId).toBe(regularUser.activeUserId)
    })
  })

  describe('準正常系', () => {
    it('認証されていないユーザーは401エラー', async () => {
      // 通常ユーザーを作成
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
        'Regular User',
      )

      const res = await requestPostAdminUser(regularUser.activeUserId.toString())

      expect(res.status).toBe(401)
    })

    it('Admin権限を持たないユーザーは403エラー', async () => {
      // 通常ユーザーを2人作成
      const regularUser1 = await adminUserTestHelper.createRegularUser(
        'user1@example.com',
        'password123',
        'Regular User 1',
      )
      const regularUser2 = await adminUserTestHelper.createRegularUser(
        'user2@example.com',
        'password123',
        'Regular User 2',
      )

      // 通常ユーザーが他のユーザーにAdmin権限を付与しようとする
      const res = await requestPostAdminUser(
        regularUser2.activeUserId.toString(),
        regularUser1.sessionId,
      )

      expect(res.status).toBe(403)
    })

    it('存在しないユーザーIDの場合404エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 存在しないユーザーIDでAdmin権限付与を試行
      const nonExistentUserId = '99999'
      const res = await requestPostAdminUser(nonExistentUserId, adminUser.sessionId)

      expect(res.status).toBe(404)
    })

    it('既にAdmin権限を持つユーザーの場合409エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 通常ユーザーを作成してAdmin権限を付与
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
        'Regular User',
      )
      await adminUserTestHelper.grantAdminRole(regularUser.activeUserId, adminUser.activeUserId)

      // 既にAdmin権限を持つユーザーに再度Admin権限を付与しようとする
      const res = await requestPostAdminUser(
        regularUser.activeUserId.toString(),
        adminUser.sessionId,
      )

      expect(res.status).toBe(409)
    })

    it('無効なユーザーIDの場合400エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 無効なユーザーIDでAdmin権限付与を試行
      const invalidUserId = 'invalid-id'
      const res = await requestPostAdminUser(invalidUserId, adminUser.sessionId)

      expect(res.status).toBe(422)
    })

    it('自分自身にAdmin権限を付与しようとした場合400エラー', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 自分自身にAdmin権限を付与しようとする
      const res = await requestPostAdminUser(adminUser.activeUserId.toString(), adminUser.sessionId)

      expect(res.status).toBe(400)
      const responseText = await res.text()
      expect(responseText).toContain('自分自身にAdmin権限を付与することはできません')
    })
  })
})
