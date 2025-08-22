// factory
import { RdbClient } from '@/infrastructure/rdb'
import CommandImpl from './infrastructure/commandImpl'
import QueryImpl from './infrastructure/queryImpl'
import { UseCase } from './useCase'

export function createPrivacyPolicyUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryImpl(db), new CommandImpl(db))
}

// バリデーションスキーマ
export {
  type PrivacyPolicy,
  type PrivacyPolicyActivate,
  type PrivacyPolicyInput,
  type PrivacyPolicyOutput,
  type PrivacyPolicyUpdate,
  privacyPolicyActivateSchema,
  privacyPolicyInputSchema,
  privacyPolicyUpdateSchema,
  type VersionParam,
  versionParamSchema,
} from './schema/privacyPolicySchema'
