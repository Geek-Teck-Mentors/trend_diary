// factory
import { RdbClient } from '@/infrastructure/rdb'
import CommandServiceImpl from './infrastructure/commandServiceImpl'
import QueryServiceImpl from './infrastructure/queryServiceImpl'
import { UseCase } from './useCase'

export function createPrivacyPolicyUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryServiceImpl(db), new CommandServiceImpl(db))
}

export type { CommandService } from './repository/commandService'

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
