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
import { isNull, Nullable } from '@/common/types/utility';
import User from '../model/user';

const SESSION_EXPIRED = 30 * 24 * 60 * 60 * 1000; // 30日, day*h*min*sec*1000ms

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

  async login(email: string, plainPassword: string): Promise<User> {
    let account: Nullable<Account>;
    try {
      account = await this.accountRepository.findByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new ServerError('Failed to find account');
    }
    if (isNull(account)) throw new NotFoundError('Account not found');

    const isPasswordMatch = await bcrypt.compare(plainPassword, account.password);
    if (!isPasswordMatch) throw new ClientError('Invalid password');

    account.recordLogin();
    try {
      await this.accountRepository.save(account);
    } catch (error) {
      throw ServerError.handle(error);
    }

    try {
      const user = await this.userRepository.findByAccountId(account.accountId);
      if (isNull(user)) throw new ServerError('User not found'); // signup時に作成されているはず

      await this.accountRepository.addSession(
        account.accountId,
        new Date(Date.now() + SESSION_EXPIRED),
      );
      return user;
    } catch (error) {
      throw ServerError.handle(error);
    }
  }

  async getLoginUser(sessionId: string): Promise<User> {
    try {
      const user = await this.userRepository.findBySessionId(sessionId);
      if (isNull(user)) throw new NotFoundError('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw ServerError.handle(error);
    }
  }

  async logout(sessionId: string): Promise<void> {
    try {
      const account = await this.accountRepository.findBySessionId(sessionId);
      if (isNull(account)) throw new NotFoundError('Account not found');
      await this.accountRepository.removeSession(sessionId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw ServerError.handle(error);
    }
  }

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
