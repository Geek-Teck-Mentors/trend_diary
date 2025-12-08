import { Env } from '@/application/env'

export function isUserFeatureEnabled(env?: Env['Bindings']): boolean {
  return env?.FEATURE_USER_ENABLED === 'true'
}

export function isReadArticleFeatureEnabled(env?: Env['Bindings']): boolean {
  return env?.FEATURE_READ_ARTICLE_ENABLED === 'true'
}
