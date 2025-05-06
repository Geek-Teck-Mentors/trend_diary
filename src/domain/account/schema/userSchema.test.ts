import { userSchema } from './userSchema';

describe('ユーザースキーマ', () => {
  const validUser = {
    userId: BigInt(123456789),
    accountId: BigInt(987654321),
    displayName: 'テストユーザー',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  it('有効なユーザーデータを受け入れること', () => {
    expect(() => {
      userSchema.parse(validUser);
    }).not.toThrow();
  });

  describe('userId のバリデーション', () => {
    it('有効なbigint型のuserIdを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: BigInt(567890123),
        });
      }).not.toThrow();
    });

    it('bigint型でないuserIdを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: '123456789',
        });
      }).toThrow();

      expect(() => {
        userSchema.parse({
          ...validUser,
          userId: 123456789,
        });
      }).toThrow();
    });
  });

  describe('accountId のバリデーション', () => {
    it('有効なbigint型のaccountIdを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          accountId: BigInt(567890123),
        });
      }).not.toThrow();
    });

    it('bigint型でないaccountIdを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          accountId: '987654321',
        });
      }).toThrow();

      expect(() => {
        userSchema.parse({
          ...validUser,
          accountId: 987654321,
        });
      }).toThrow();
    });
  });

  describe('displayName のバリデーション', () => {
    it('displayNameが提供されている場合に受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          displayName: 'テスト名前',
        });
      }).not.toThrow();
    });

    it('displayNameが提供されていない場合も受け入れること', () => {
      const { displayName, ...userWithoutDisplayName } = validUser;
      expect(() => {
        userSchema.parse(userWithoutDisplayName);
      }).not.toThrow();
    });

    it('文字列でないdisplayNameを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          displayName: 123,
        });
      }).toThrow();
    });
  });
});
