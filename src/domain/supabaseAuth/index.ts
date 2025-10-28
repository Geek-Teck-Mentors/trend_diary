import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseAuthImpl } from './infrastructure/supabaseAuthImpl'
import { SupabaseAuthUseCase } from './useCase'

export function createSupabaseAuthUseCase(client: SupabaseClient): SupabaseAuthUseCase {
  const repository = new SupabaseAuthImpl(client)
  return new SupabaseAuthUseCase(repository)
}

export type { SupabaseAuthSession } from './model/session'
export type { SupabaseAuthUser } from './model/user'
export type { SupabaseAuthRepository } from './repository'
export * from './schema/authSchema'
export type { LoginResult, SignupResult } from './useCase'
export { SupabaseAuthUseCase } from './useCase'
