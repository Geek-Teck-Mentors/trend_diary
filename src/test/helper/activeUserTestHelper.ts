import { isError } from '@/common/types/utility'
import { 
  ActiveUserRepositoryImpl, 
  UserRepositoryImpl, 
  SessionRepositoryImpl,
  ActiveUserService 
} from '@/domain/account'
import getRdbClient, { Transaction } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class ActiveUserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private activeUserRepository = new ActiveUserRepositoryImpl(this.rdb)
  private userRepository = new UserRepositoryImpl(this.rdb)
  private sessionRepository = new SessionRepositoryImpl(this.rdb)

  private service = new ActiveUserService(
    this.activeUserRepository, 
    this.userRepository,
    this.sessionRepository
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

  async create(email: string, password: string, displayName?: string): Promise<{ userId: bigint; activeUserId: bigint }> {
    const transaction = new Transaction(this.rdb)
    const result = await this.service.signup(transaction, email, password, displayName)
    if (isError(result)) {
      throw new Error(`Failed to create user: ${result.error.message}`)
    }
    return {
      userId: result.data.userId,
      activeUserId: result.data.activeUserId,
    }
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ 
    userId: bigint; 
    activeUserId: bigint;
    sessionId: string;
    expiresAt: Date;
  }> {
    const transaction = new Transaction(this.rdb)
    const loginResult = await this.service.login(transaction, email, password, ipAddress, userAgent)
    if (isError(loginResult)) {
      throw new Error(`Failed to login: ${loginResult.error.message}`)
    }
    return {
      userId: loginResult.data.user.userId,
      activeUserId: loginResult.data.activeUser.activeUserId,
      sessionId: loginResult.data.sessionId,
      expiresAt: loginResult.data.expiresAt,
    }
  }

  async logout(sessionId: string): Promise<void> {
    const result = await this.service.logout(sessionId)
    if (isError(result)) {
      throw new Error(`Failed to logout: ${result.error.message}`)
    }
  }

  async findBySessionId(sessionId: string): Promise<{ userId: bigint; activeUserId: bigint } | null> {
    const result = await this.service.findBySessionId(sessionId)
    if (isError(result)) {
      throw new Error(`Failed to find user by session: ${result.error.message}`)
    }
    if (!result.data) return null
    
    return {
      userId: result.data.user.userId,
      activeUserId: result.data.activeUser.activeUserId,
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