import { NotFoundError, AlreadyExistsError } from '../../common/errors';

export const ACCOUNT_NOT_FOUND = new NotFoundError('Account not found');
export const ACCOUNT_ALREADY_EXISTS = new AlreadyExistsError('Account already exists');
