import getRdbClient, { Transaction } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account'

process.env.NODE_ENV = 'test'

class AccountTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private accountRepository = new AccountRepositoryImpl(this.rdb)

  private userRepository = new UserRepositoryImpl(this.rdb)

  private service = new AccountService(this.accountRepository, this.userRepository)

  async cleanUp(): Promise<void> {
    // 外部キー制約を考慮した順序でTRUNCATE
    // read_histories → sessions → accounts → users
    await this.rdb.$queryRaw`TRUNCATE TABLE "read_histories" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "sessions" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "accounts" CASCADE;`
    await this.rdb.$queryRaw`TRUNCATE TABLE "users" CASCADE;`
  }

  async createTestAccount(email: string, password: string): Promise<void> {
    const transaction = new Transaction(this.rdb)
    await this.service.signup(transaction, email, password)
  }

  async deleteAllSessions(): Promise<void> {
    await this.rdb.session.deleteMany()
  }

  async deleteAllAccounts(): Promise<void> {
    await this.rdb.account.deleteMany()
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const accountTestHelper = new AccountTestHelper()
export default accountTestHelper
