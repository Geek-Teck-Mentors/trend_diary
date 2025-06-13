import getRdbClient, { Transaction } from '@/infrastructure/rdb';
import TEST_ENV from '@/test/env';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';

process.env.NODE_ENV = 'test';

class AccountTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL);

  private accountRepository = new AccountRepositoryImpl(this.rdb);

  private userRepository = new UserRepositoryImpl(this.rdb);

  private service = new AccountService(this.accountRepository, this.userRepository);

  async cleanUp(): Promise<void> {
    await this.rdb.$queryRaw`TRUNCATE TABLE "accounts";`;
    await this.rdb.$queryRaw`TRUNCATE TABLE "users";`;
  }

  async createTestAccount(email: string, password: string): Promise<void> {
    const transaction = new Transaction(this.rdb);
    await this.service.signup(transaction, email, password);
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect();
  }
}

const accountTestHelper = new AccountTestHelper();
export default accountTestHelper;
