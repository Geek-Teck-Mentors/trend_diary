export class SupabaseClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseClientError";
  }
}
