import { ActiveUser } from './active-user-schema'

export function recordLogin(user: ActiveUser): ActiveUser {
  return { ...user, lastLogin: new Date() }
}
