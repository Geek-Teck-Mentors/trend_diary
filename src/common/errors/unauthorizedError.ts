import ClientError from './clientError'

export default class UnauthorizedError extends ClientError {
  constructor(message: string) {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}
