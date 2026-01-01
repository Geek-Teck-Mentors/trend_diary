import { SupabaseClient } from '@supabase/supabase-js'
import { RdbClient } from '@/infrastructure/rdb'
import CommandImpl from './infrastructure/commandImpl'
import QueryImpl from './infrastructure/queryImpl'
import { SupabaseAuthRepository } from './infrastructure/supabaseAuthRepository'
import { AuthV2UseCase } from './useCase'

export function createAuthV2UseCase(client: SupabaseClient, db: RdbClient): AuthV2UseCase {
  const repository = new SupabaseAuthRepository(client)
  const userCommand = new CommandImpl(db)
  const userQuery = new QueryImpl(db)
  return new AuthV2UseCase(repository, userCommand, userQuery)
}
