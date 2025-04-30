export class DataFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataFetchError";
  }
}
