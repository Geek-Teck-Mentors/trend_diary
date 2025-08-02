import { isError } from '@/common/types/utility'
import {
  ActiveUserRepositoryImpl,
  ActiveUserService,
  SessionRepositoryImpl,
  UserRepositoryImpl,
} from '@/domain/user'
import getRdbClient, { Transaction } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class UserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private activeUserRepository = new ActiveUserRepositoryImpl(this.rdb)

  private userRepository = new UserRepositoryImpl(this.rdb)

  private sessionRepository = new SessionRepositoryImpl(this.rdb)

  private service = new ActiveUserService(
    this.activeUserRepository,
    this.userRepository,
    this.sessionRepository,
  )

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
    const transaction = new Transaction(this.rdb)
    await this.service.signup(transaction, email, password)
  }

  async login(email: string, password: string): Promise<{ userId: bigint; sessionId: string }> {
    const loginResult = await this.service.login(email, password)
    if (isError(loginResult)) {
      throw new Error(`Failed to login: ${loginResult.error.message}`)
    }
    return {
      userId: loginResult.data.user.userId,
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
