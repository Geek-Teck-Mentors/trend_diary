export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}
export class MediaFetchError extends InternalServerError {
  constructor(message: string) {
    super(message);
    this.name = "MediaFetchError";
  }
}

export class DatabaseError extends InternalServerError {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}
