import { isFailure } from '@yuukihayashi0510/core'
import { createUserUseCase } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class ActiveUserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private useCase = createUserUseCase(this.rdb)

  async cleanUp(): Promise<void> {
    // 外部キー制約を考慮した順序でTRUNCATE
    // read_histories → sessions → active_users/banned_users/leaved_users → users
    await this.rdb.$queryRaw`TRUNCATE TABLE "read_histories" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "sessions" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "active_users" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "banned_users" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "leaved_users" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "users" CASCADE;`
  }

  async create(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ userId: bigint; activeUserId: bigint }> {
    const result = await this.useCase.signup(email, password)
    if (isFailure(result)) {
      throw new Error(`Failed to create user: ${result.error.message}`)
    }
    return {
      userId: result.data.userId,
      activeUserId: result.data.activeUserId,
    }
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    activeUserId: bigint
    sessionId: string
    expiresAt: Date
  }> {
    const loginResult = await this.useCase.login(email, password, ipAddress, userAgent)
    if (isFailure(loginResult)) {
      throw new Error(`Failed to login: ${loginResult.error.message}`)
    }
    return {
      activeUserId: loginResult.data.activeUser.activeUserId,
      sessionId: loginResult.data.sessionId,
      expiresAt: loginResult.data.expiresAt,
    }
  }

  async logout(sessionId: string): Promise<void> {
    const result = await this.useCase.logout(sessionId)
    if (isFailure(result)) {
      throw new Error(`Failed to logout: ${result.error.message}`)
    }
  }

  async findBySessionId(sessionId: string): Promise<{ activeUserId: bigint } | null> {
    const result = await this.useCase.getCurrentUser(sessionId)
    if (isFailure(result)) {
      throw new Error(`Failed to find user by session: ${result.error.message}`)
    }
    if (!result.data) return null

    return {
      activeUserId: result.data.activeUserId,
    }
  }

  async deleteAllSessions(): Promise<void> {
    await this.rdb.session.deleteMany()
  }

  async deleteAllActiveUsers(): Promise<void> {
    await this.rdb.activeUser.deleteMany()
  }

  async deleteAllUsers(): Promise<void> {
    await this.rdb.user.deleteMany()
  }

  // 後方互換性のためのエイリアス
  async deleteAllAccounts(): Promise<void> {
    await this.deleteAllActiveUsers()
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const activeUserTestHelper = new ActiveUserTestHelper()
export default activeUserTestHelper
