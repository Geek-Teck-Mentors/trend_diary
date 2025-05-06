import bcrypt from 'bcryptjs';
import { AccountRepository } from '../repository/accountRepository';
import {
  AlreadyExistsError,
  ClientError,
  NotFoundError,
  ServerError,
} from '../../../common/errors';
import { UserRepository } from '../repository/userRepository';
import Account from '../model/account';
import { isNull } from '@/common/types/utility';
import User from '../model/user';

export default class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private userRepository: UserRepository,
  ) {}

  async signup(email: string, plainPassword: string): Promise<Account> {
    // 既にアカウントがあるかチェック
    const existingAccount = await this.accountRepository.findByEmail(email);
    if (existingAccount) throw new AlreadyExistsError('Account already exists');

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // アカウント作成 & ユーザー作成
    try {
      return await this.accountRepository.transaction(async () => {
        const account = await this.accountRepository.createAccount(email, hashedPassword);
        await this.userRepository.create(account.accountId);

        return account;
      });
    } catch (error) {
      throw ServerError.handle(error);
    }
  }

  async login(accountId: bigint, plainPassword: string): Promise<User> {
    const account = await this.accountRepository.findById(accountId);
    if (isNull(account)) throw new NotFoundError('Account not found');

    const isMatchPassword = await bcrypt.compare(plainPassword, account.password);
    if (!isMatchPassword) throw new ClientError('Invalid password');

    account.recordLogin();
    try {
      await this.accountRepository.save(account);
    } catch (error) {
      throw ServerError.handle(error);
    }

    try {
      const user = await this.userRepository.findByAccountId(account.accountId);
      if (isNull(user)) throw new ServerError('User not found'); // signup時に作成されているはず
      return user;
    } catch (error) {
      throw ServerError.handle(error);
    }
  }

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
