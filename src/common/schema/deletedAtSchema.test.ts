import deletedAtSchema from './deletedAtSchema';

describe('deletedAtSchema', () => {
  const validBase = {
    deletedAt: new Date(),
  };

  describe('deletedAt', () => {
    it('deletedAtが日付型の場合に受け入れること', () => {
      expect(() => {
        deletedAtSchema.parse(validBase);
      }).not.toThrow();
    });

    it('deletedAtがundefinedの場合に受け入れること', () => {
      const { ...withoutDeletedAt } = validBase;
      expect(() => {
        deletedAtSchema.parse(withoutDeletedAt);
      }).not.toThrow();
    });

    it('日付型でないdeletedAtを拒否すること', () => {
      expect(() => {
        deletedAtSchema.parse({
          ...validBase,
          deletedAt: 'not-a-date',
        });
      }).toThrow();
    });

    it('nullのdeletedAtを拒否すること', () => {
      expect(() => {
        deletedAtSchema.parse({
          ...validBase,
          deletedAt: null,
        });
      }).toThrow();
    });
  });
});
