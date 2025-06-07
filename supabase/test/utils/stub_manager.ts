export default class StubManager {
  private stubs: Array<{ restore: () => void }> = [];

  addStub<T extends { restore: () => void }>(stubInstance: T): T {
    this.stubs.push(stubInstance);
    return stubInstance;
  }

  [Symbol.dispose]() {
    this.stubs.forEach((stub) => stub.restore());
    this.stubs.length = 0;
  }
}
