import { Env } from '@/application/env'

export function isUserFeatureEnabled(env?: Env['Bindings']): boolean {
  return env?.FEATURE_USER_ENABLED === 'true'
}
