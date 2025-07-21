import { isError } from '@/common/types/utility'
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account'
import getRdbClient, { Transaction } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

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

  async create(email: string, password: string): Promise<void> {
    const transaction = new Transaction(this.rdb)
    console.log(`アカウント作成開始: ${email}`)

    try {
      const result = await this.service.signup(transaction, email, password)
      console.log(`サービス処理完了: ${email}`)

      // トランザクションが正常に完了したか確認
      const accountExists = await this.findAccountByEmail(email)
      const userExists = await this.findUserByEmail(email)

      console.log(`作成確認結果: account=${!!accountExists}, user=${!!userExists}`)

      if (!accountExists || !userExists) {
        throw new Error(
          `アカウント作成が不完全です: account=${!!accountExists}, user=${!!userExists}`,
        )
      }

      console.log(`アカウント作成成功: ${email}`)
    } catch (error) {
      console.log(`アカウント作成エラー: ${email}`, error.message)
      throw error
    }
  }

  async login(email: string, password: string): Promise<{ userId: bigint; sessionId: string }> {
    console.log(`ログイン開始: ${email}`)

    // 事前確認：アカウントとユーザーが存在するか
    const account = await this.findAccountByEmail(email)
    const user = await this.findUserByEmail(email)
    console.log(`ログイン事前確認: account=${!!account}, user=${!!user}`)

    if (!account || !user) {
      throw new Error(`ログイン前確認失敗: account=${!!account}, user=${!!user}`)
    }

    const loginResult = await this.service.login(email, password)
    console.log(`ログインサービス処理完了: ${email}`)

    if (isError(loginResult)) {
      console.log(`ログインエラー: ${email}`, loginResult.error.message)
      throw new Error(`Failed to login: ${loginResult.error.message}`)
    }

    console.log(`ログイン成功: ${email}`)
    return {
      userId: loginResult.data.user.userId,
      sessionId: loginResult.data.sessionId,
    }
  }

  async deleteAllSessions(): Promise<void> {
    await this.rdb.session.deleteMany()
  }

  async deleteAllAccounts(): Promise<void> {
    await this.rdb.account.deleteMany()
  }

  async findAccountByEmail(email: string): Promise<{ accountId: bigint; email: string } | null> {
    const account = await this.rdb.account.findUnique({
      where: { email },
      select: {
        accountId: true,
        email: true,
      },
    })
    return account
  }

  async findUserByEmail(email: string): Promise<{ userId: bigint; accountId: bigint } | null> {
    // accountIdを使用してaccountテーブルと結合
    const account = await this.rdb.account.findUnique({
      where: { email },
    })

    if (!account) return null

    const user = await this.rdb.user.findFirst({
      where: {
        accountId: account.accountId,
      },
      select: {
        userId: true,
        accountId: true,
      },
    })
    return user
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const accountTestHelper = new AccountTestHelper()
export default accountTestHelper
