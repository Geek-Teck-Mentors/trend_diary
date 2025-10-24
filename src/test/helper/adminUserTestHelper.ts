import { isError } from '@/common/types/utility'
import { createAdminUserUseCase } from '@/domain/admin'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import authTestHelper from './authTestHelper'

process.env.NODE_ENV = 'test'

class AdminUserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private useCase = createAdminUserUseCase(this.rdb)

  async cleanUp(): Promise<void> {
    // User関連テーブルをクリーンアップ（CASCADE で admin_users も削除される）
    await authTestHelper.cleanUp()
  }

  async createAdminUser(
    email: string,
    password: string,
  ): Promise<{ userId: bigint; adminUserId: number; accessToken: string }> {
    // 通常ユーザーを作成
    const userInfo = await authTestHelper.create(email, password)

    // Admin権限を付与
    const adminResult = await this.useCase.grantAdminRole(userInfo.userId, 1)
    if (isError(adminResult)) {
      throw new Error(`Failed to grant admin role: ${adminResult.error.message}`)
    }

    // ログインしてアクセストークンを取得
    const loginInfo = await authTestHelper.login(email, password)

    return {
      userId: userInfo.userId,
      adminUserId: adminResult.data.adminUserId,
      accessToken: loginInfo.accessToken,
    }
  }

  async createRegularUser(
    email: string,
    password: string,
  ): Promise<{ userId: bigint; accessToken: string }> {
    // 通常ユーザーを作成（Admin権限は付与しない）
    const userInfo = await authTestHelper.create(email, password)
    const loginInfo = await authTestHelper.login(email, password)

    return {
      userId: userInfo.userId,
      accessToken: loginInfo.accessToken,
    }
  }

  async grantAdminRole(
    userId: bigint,
    grantedByAdminUserId: number,
  ): Promise<{ adminUserId: number }> {
    const result = await this.useCase.grantAdminRole(userId, grantedByAdminUserId)
    if (isError(result)) {
      throw new Error(`Failed to grant admin role: ${result.error.message}`)
    }
    return {
      adminUserId: result.data.adminUserId,
    }
  }

  async isAdmin(userId: bigint): Promise<boolean> {
    const result = await this.useCase.isAdmin(userId)
    if (isError(result)) {
      throw new Error(`Failed to check admin status: ${result.error.message}`)
    }
    return result.data
  }

  async getUserList(query?: { searchQuery?: string; page?: number; limit?: number }): Promise<{
    users: Array<{
      userId: bigint
      email: string
      displayName: string | null
      isAdmin: boolean
      grantedAt: Date | null
      grantedByAdminUserId: number | null
      createdAt: Date
    }>
    total: number
  }> {
    const result = await this.useCase.getUserList(query)
    if (isError(result)) {
      throw new Error(`Failed to get user list: ${result.error.message}`)
    }
    return result.data
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const adminUserTestHelper = new AdminUserTestHelper()
export default adminUserTestHelper
