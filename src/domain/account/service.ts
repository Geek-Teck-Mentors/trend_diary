import * as bcrypt from 'bcrypt';
import { AccountRepository, UserRepository } from './repository';
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
    // 既にアカウントがあるかチェック
    const existingAccount = await this.accountRepository.findByEmail(email);
    if (existingAccount) throw ACCOUNT_ALREADY_EXISTS;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // アカウント作成 & ユーザー作成
    try {
      await this.accountRepository.transaction(async () => {
        const account = await this.accountRepository.createAccount(email, hashedPassword);
        await this.userRepository.createUser(account.accountId);
      });
    } catch (error) {
      throw ServerError.handle(error);
    }
  }

  async login(accountId: UUID, plainPassword: string): Promise<boolean> {
    // 存在確認
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw ACCOUNT_NOT_FOUND;

    // パスワードの照合
    const isPasswordMatch = await bcrypt.compare(plainPassword, account.password);
    if (!isPasswordMatch) return false;

    // 最終ログインを記録
    account.recordLogin();
    try {
      await this.accountRepository.save(account);
    } catch (error) {
      throw ServerError.handle(error);
    }

    return true;
  }

  // ログアウト
  async logout(accountId: UUID): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw ACCOUNT_NOT_FOUND;

    // TODO: 後でセッションの削除処理を追加
  }

  // アカウントの削除
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
