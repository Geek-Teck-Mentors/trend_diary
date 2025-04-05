import { userSchema } from '../schema';

describe('ユーザースキーマ', () => {
  const validUser = {
    userId: BigInt(123456789),
    accountId: BigInt(987654321),
    displayName: 'テストユーザー',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
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

  describe('createdAt と updatedAt', () => {
    it('有効な文字列形式のcreatedAtとupdatedAtを受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: '2023-05-01T12:00:00Z',
          updatedAt: '2023-05-02T14:30:00Z',
        });
      }).not.toThrow();
    });

    it('文字列でないcreatedAtを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          createdAt: new Date(),
        });
      }).toThrow();
    });

    it('文字列でないupdatedAtを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          updatedAt: new Date(),
        });
      }).toThrow();
    });
  });

  describe('deletedAt', () => {
    it('deletedAtが日付型の場合に受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          deletedAt: new Date(),
        });
      }).not.toThrow();
    });

    it('deletedAtがundefinedの場合に受け入れること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          deletedAt: undefined,
        });
      }).not.toThrow();
    });

    it('日付型でもundefinedでもないdeletedAtを拒否すること', () => {
      expect(() => {
        userSchema.parse({
          ...validUser,
          deletedAt: '2023-05-03T10:15:00Z',
        });
      }).toThrow();

      expect(() => {
        userSchema.parse({
          ...validUser,
          deletedAt: null,
        });
      }).toThrow();
    });
  });
});
