import * as bcrypt from 'bcrypt';
import { AccountRepository, UserRepository } from './repository';
import { accountSchema } from './schema';
import UUID from '../../common/uuid';
import { ACCOUNT_ALREADY_EXISTS, ACCOUNT_NOT_FOUND } from './error';
import { isNull } from '../../common/typeUtility';
import { ServerError } from '../../common/errors';

export default class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private userRepository: UserRepository,
  ) {}

  async signUp(email: string, plainPassword: string): Promise<void> {
    const emailValidation = accountSchema.shape.email.safeParse(email);
    if (!emailValidation.success) {
      throw new Error(`Invalid email format: ${emailValidation.error.message}`);
    }

    const passwordValidation = accountSchema.shape.password.safeParse(plainPassword);
    if (!passwordValidation.success) {
      throw new Error(`Password does not meet requirements: ${passwordValidation.error.message}`);
    }

    // 既にアカウントがあるかチェック
    const existingAccount = await this.accountRepository.findByEmail(email);
    if (existingAccount) throw ACCOUNT_ALREADY_EXISTS;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // アカウント作成 & ユーザー作成
    try {
      const account = await this.accountRepository.createAccount(email, hashedPassword);
      await this.userRepository.createUser(account.accountId);
    } catch (error) {
      throw ServerError.handle(error);
    }
  }

  async login(accountId: UUID, plainPassword: string): Promise<boolean> {
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw ACCOUNT_NOT_FOUND;

    return bcrypt.compare(plainPassword, account.password);
  }

  async logout(accountId: UUID): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw ACCOUNT_NOT_FOUND;

    // TODO: 後でセッションの削除処理を追加
  }

  async recordLogin(accountId: UUID): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw ACCOUNT_NOT_FOUND;

    account.recordLogin();

    try {
      await this.accountRepository.save(account);
    } catch (error) {
      throw ServerError.handle(error);
    }
  }

  async deactivateAccount(accountId: UUID): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw ACCOUNT_NOT_FOUND;

    account.deactivate();

    try {
      await this.accountRepository.save(account);
    } catch (error) {
      throw ServerError.handle(error);
    }
  }
}
