import app from '@/application/server'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from '@/test/helper/activeUserTestHelper'
import adminUserTestHelper from '@/test/helper/adminUserTestHelper'
import { UserListResponse } from './getUserList'

describe('GET /api/admin/users', () => {
  async function requestGetUsers(query?: Record<string, string>, sessionId?: string) {
    const qs = query ? new URLSearchParams(query).toString() : ''
    const url = qs ? `/api/admin/users?${qs}` : '/api/admin/users'
    const headers = sessionId ? { Cookie: `sid=${sessionId}` } : undefined
    return app.request(url, { method: 'GET', headers }, TEST_ENV)
  }

  beforeEach(async () => {
    await activeUserTestHelper.cleanUp()
    await adminUserTestHelper.cleanUp()
  })

  afterEach(async () => {
    await activeUserTestHelper.cleanUp()
    await adminUserTestHelper.cleanUp()
  })

  describe('正常系', () => {
    it('Admin権限を持つユーザーがユーザー一覧を取得できる', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 通常ユーザーも作成
      await adminUserTestHelper.createRegularUser('user@example.com', 'password123', 'Regular User')

      // Admin権限でユーザー一覧取得
      const res = await requestGetUsers(undefined, adminUser.sessionId)

      expect(res.status).toBe(200)
      const data = await res.json<UserListResponse>()
      expect(data.users).toHaveLength(2)
      expect(data.total).toBe(2)

      // Adminユーザーの情報を確認
      const admin = data.users.find((user) => user.hasAdminAccess)
      expect(admin).toBeDefined()
      expect(admin!.email).toBe('admin@example.com')

      // 通常ユーザーの情報を確認
      const regular = data.users.find((user) => !user.hasAdminAccess)
      expect(regular).toBeDefined()
      expect(regular!.email).toBe('user@example.com')
    })

    it('検索クエリでユーザーをフィルタリングできる', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 複数の通常ユーザーを作成
      await adminUserTestHelper.createRegularUser('john@example.com', 'password123', 'John Doe')
      await adminUserTestHelper.createRegularUser('jane@example.com', 'password123', 'Jane Smith')

      // 検索クエリでフィルタリング
      const res = await requestGetUsers({ searchQuery: 'john' }, adminUser.sessionId)

      expect(res.status).toBe(200)
      const data = await res.json<UserListResponse>()
      expect(data.users).toHaveLength(1)
      expect(data.users[0].email).toBe('john@example.com')
    })

    it('ページネーションが正常に動作する', async () => {
      // Adminユーザーを作成
      const adminUser = await adminUserTestHelper.createAdminUser(
        'admin@example.com',
        'password123',
        'Admin User',
      )

      // 複数のユーザーを作成（3人）
      await adminUserTestHelper.createRegularUser('user1@example.com', 'password123', 'User 1')
      await adminUserTestHelper.createRegularUser('user2@example.com', 'password123', 'User 2')
      await adminUserTestHelper.createRegularUser('user3@example.com', 'password123', 'User 3')

      // 1ページ目（limit=2）
      const page1 = await requestGetUsers({ page: '1', limit: '2' }, adminUser.sessionId)

      expect(page1.status).toBe(200)
      const data1 = await page1.json<UserListResponse>()
      expect(data1.users).toHaveLength(2)
      expect(data1.total).toBe(4) // admin + 3 users
      expect(data1.page).toBe(1)
      expect(data1.limit).toBe(2)

      // 2ページ目
      const page2 = await requestGetUsers({ page: '2', limit: '2' }, adminUser.sessionId)

      expect(page2.status).toBe(200)
      const data2 = await page2.json<UserListResponse>()
      expect(data2.users).toHaveLength(2)
      expect(data2.page).toBe(2)
    })
  })

  describe('準正常系', () => {
    it('認証されていないユーザーは401エラー', async () => {
      const res = await requestGetUsers()

      expect(res.status).toBe(401)
    })

    it('Admin権限を持たないユーザーは403エラー', async () => {
      // 通常ユーザーを作成
      const regularUser = await adminUserTestHelper.createRegularUser(
        'user@example.com',
        'password123',
        'Regular User',
      )

      // 通常ユーザーでアクセス
      const res = await requestGetUsers(undefined, regularUser.sessionId)

      expect(res.status).toBe(403)
    })
  })
})
