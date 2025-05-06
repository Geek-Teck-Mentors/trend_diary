import bcrypt from 'bcryptjs';
import { AccountRepository } from '../repository';
import { ACCOUNT_ALREADY_EXISTS } from '../error';
import { AlreadyExistsError, ServerError } from '../../../common/errors';
import { UserRepository } from '../../user/repository';
import Account from '../model/account';

export default class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private userRepository: UserRepository,
  ) {}

  async signup(email: string, plainPassword: string): Promise<Account> {
    // 既にアカウントがあるかチェック
    const existingAccount = await this.accountRepository.findByEmail(email);
    if (existingAccount) throw ACCOUNT_ALREADY_EXISTS;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // アカウント作成 & ユーザー作成
    try {
      return await this.accountRepository.transaction(async () => {
        const account = await this.accountRepository.createAccount(email, hashedPassword);
        await this.userRepository.createUser(account.accountId);

        return account;
      });
    } catch (error) {
      if (error instanceof AlreadyExistsError) throw ACCOUNT_ALREADY_EXISTS;
      throw ServerError.handle(error);
    }
  }

  // async login(accountId: bigint, plainPassword: string): Promise<boolean> {
  //   // 存在確認
  //   const account = await this.accountRepository.findById(accountId);
  //   if (isNull(account)) throw ACCOUNT_NOT_FOUND;

  //   // パスワードの照合
  //   const isPasswordMatch = await bcrypt.compare(plainPassword, account.password);
  //   if (!isPasswordMatch) return false;

  //   // 最終ログインを記録
  //   account.recordLogin();
  //   try {
  //     await this.accountRepository.save(account);
  //   } catch (error) {
  //     throw ServerError.handle(error);
  //   }

  //   return true;
  // }

  // // ログアウト
  // async logout(accountId: bigint): Promise<void> {
  //   const account = await this.accountRepository.findById(accountId);
  //   if (isNull(account)) throw ACCOUNT_NOT_FOUND;

  //   // TODO: 後でセッションの削除処理を追加
  // }

  // // アカウントの削除
  // async deactivateAccount(accountId: bigint): Promise<void> {
  //   const account = await this.accountRepository.findById(accountId);
  //   if (isNull(account)) throw ACCOUNT_NOT_FOUND;

  //   try {
  //     await this.accountRepository.delete(account);
  //   } catch (error) {
  //     throw ServerError.handle(error);
  //   }
  // }
}
