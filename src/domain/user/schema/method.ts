import { ActiveUser } from './activeUserSchema'

export function recordLogin(user: ActiveUser): ActiveUser {
  return { ...user, lastLogin: new Date() }
}
