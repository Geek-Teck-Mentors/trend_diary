import ClientError from './clientError';

export default class ValidationError extends ClientError {
  public readonly statusCode: number = 422;

  public readonly details: Record<string, string[]>;

  constructor(message: string, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
    this.details = details || {};
  }
}
