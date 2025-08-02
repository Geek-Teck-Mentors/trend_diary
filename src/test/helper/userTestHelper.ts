import { isError } from '@/common/types/utility'
import { createActiveUserService } from '@/domain/user'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class UserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private service = createActiveUserService(this.rdb)

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

  async create(email: string, password: string): Promise<void> {
    await this.service.signup(email, password)
  }

  async login(email: string, password: string): Promise<{ userId: bigint; sessionId: string }> {
    const loginResult = await this.service.login(email, password)
    if (isError(loginResult)) {
      throw new Error(`Failed to login: ${loginResult.error.message}`)
    }
    return {
      userId: loginResult.data.activeUser.activeUserId,
      sessionId: loginResult.data.sessionId,
    }
  }

  async deleteAllSessions(): Promise<void> {
    await this.rdb.session.deleteMany()
  }

  async deleteAllAccounts(): Promise<void> {
    await this.rdb.activeUser.deleteMany()
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const userTestHelper = new UserTestHelper()
export default userTestHelper
