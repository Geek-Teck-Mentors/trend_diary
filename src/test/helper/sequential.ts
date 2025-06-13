/**
 * テストケースを順次実行するためのヘルパー関数
 */
export async function runTestCasesSequentially<T>(
  testCases: T[],
  testFunction: (testCase: T) => Promise<void>
): Promise<void> {
  await testCases.reduce(async (previousPromise, testCase) => {
    await previousPromise;
    await testFunction(testCase);
  }, Promise.resolve());
}

export default {
  runTestCasesSequentially,
};
