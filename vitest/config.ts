export const coverageReporter = ['text', 'json-summary', 'json'];

export const coverageThresholds = {
  statements: 60, // 命令網羅, ソースコードの全ての命令が実行されるかどうか
  branches: 60, // 分岐網羅, 処理のパスの通過率とほぼ同義
  functions: 60, // 関数網羅, 関数の実行パスの通過率
  lines: 60, // 行網羅, ソースコードの全ての行が実行されるかどうか
};

export function generateIncludes(...paths: string[]) {
  const testInclude = paths.map((path) => `${path}/**/*.test.ts`);
  const coverageInclude = paths.map((path) => `${path}/**/*`);
  return { testInclude, coverageInclude };
}
