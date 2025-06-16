import { articleQuerySchema } from './articleQuerySchema';

describe('記事検索スキーマ', () => {
  it('有効な記事検索パラメータを受け入れること', () => {
    expect(() => {
      articleQuerySchema.parse({
        title: 'テスト記事',
        author: 'テスト著者',
        media: 'qiita',
        date: '2024-01-01',
        read_status: '0',
      });
    }).not.toThrow();
  });

  it('空のオブジェクトを受け入れること', () => {
    expect(() => {
      articleQuerySchema.parse({});
    }).not.toThrow();
  });

  describe('title のバリデーション', () => {
    it('有効な文字列のtitleを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          title: 'テスト記事タイトル',
        });
      }).not.toThrow();
    });

    it('空文字列のtitleを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          title: '',
        });
      }).not.toThrow();
    });

    it('文字列以外のtitleを拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          title: 123,
        });
      }).toThrow();
    });
  });

  describe('author のバリデーション', () => {
    it('有効な文字列のauthorを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          author: 'テスト著者',
        });
      }).not.toThrow();
    });

    it('空文字列のauthorを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          author: '',
        });
      }).not.toThrow();
    });

    it('文字列以外のauthorを拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          author: 123,
        });
      }).toThrow();
    });
  });

  describe('media のバリデーション', () => {
    it('有効なmedia値を受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          media: 'qiita',
        });
      }).not.toThrow();

      expect(() => {
        articleQuerySchema.parse({
          media: 'zenn',
        });
      }).not.toThrow();
    });

    it('無効なmedia値を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          media: 'invalid',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          media: 'hatena',
        });
      }).toThrow();
    });
  });

  describe('date のバリデーション', () => {
    it('有効な日付形式を受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          date: '2024-01-01',
        });
      }).not.toThrow();

      expect(() => {
        articleQuerySchema.parse({
          date: '2023-12-31',
        });
      }).not.toThrow();
    });

    it('無効な日付形式を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          date: '2024/01/01',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          date: '24-01-01',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          date: '2024-1-1',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          date: 'invalid-date',
        });
      }).toThrow();
    });
  });

  describe('read_status のバリデーション', () => {
    it('有効なread_status値を受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          read_status: '0',
        });
      }).not.toThrow();

      expect(() => {
        articleQuerySchema.parse({
          read_status: '1',
        });
      }).not.toThrow();
    });

    it('無効なread_status値を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          read_status: '2',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          read_status: 'true',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          read_status: 0,
        });
      }).toThrow();
    });
  });

  describe('from のバリデーション', () => {
    it('有効な日付形式を受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          from: '2024-01-01',
        });
      }).not.toThrow();

      expect(() => {
        articleQuerySchema.parse({
          from: '2023-12-31',
        });
      }).not.toThrow();
    });

    it('無効な日付形式を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          from: '2024/01/01',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          from: '24-01-01',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          from: '2024-1-1',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          from: 'invalid-date',
        });
      }).toThrow();
    });
  });

  describe('to のバリデーション', () => {
    it('有効な日付形式を受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          to: '2024-01-01',
        });
      }).not.toThrow();

      expect(() => {
        articleQuerySchema.parse({
          to: '2023-12-31',
        });
      }).not.toThrow();
    });

    it('無効な日付形式を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          to: '2024/01/01',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          to: '24-01-01',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          to: '2024-1-1',
        });
      }).toThrow();

      expect(() => {
        articleQuerySchema.parse({
          to: 'invalid-date',
        });
      }).toThrow();
    });
  });

  describe('複合パラメータのバリデーション', () => {
    it('複数の有効なパラメータの組み合わせを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          title: 'React入門',
          media: 'qiita',
          read_status: '0',
        });
      }).not.toThrow();
    });

    it('一部が無効なパラメータの組み合わせを拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          title: 'React入門',
          media: 'invalid',
          read_status: '0',
        });
      }).toThrow();
    });

    it('from と to の組み合わせを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          from: '2024-01-01',
          to: '2024-01-31',
        });
      }).not.toThrow();
    });

    it('from のみを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          from: '2024-01-01',
        });
      }).not.toThrow();
    });

    it('to のみを受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          to: '2024-01-31',
        });
      }).not.toThrow();
    });

    it('date と from の併用を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          date: '2024-01-01',
          from: '2024-01-01',
        });
      }).toThrow();
    });

    it('date と to の併用を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          date: '2024-01-01',
          to: '2024-01-31',
        });
      }).toThrow();
    });

    it('date と from, to の併用を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          date: '2024-01-01',
          from: '2024-01-01',
          to: '2024-01-31',
        });
      }).toThrow();
    });

    it('from が to より後の日付の場合を拒否すること', () => {
      expect(() => {
        articleQuerySchema.parse({
          from: '2024-01-31',
          to: '2024-01-01',
        });
      }).toThrow();
    });

    it('from と to が同じ日付の場合を受け入れること', () => {
      expect(() => {
        articleQuerySchema.parse({
          from: '2024-01-01',
          to: '2024-01-01',
        });
      }).not.toThrow();
    });
  });
});
