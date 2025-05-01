export class MediaFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaFetchError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}
