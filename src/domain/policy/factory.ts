import { RdbClient } from '@/infrastructure/rdb'
import CommandServiceImpl from './infrastructure/commandServiceImpl'
import QueryServiceImpl from './infrastructure/queryServiceImpl'
import { UseCase } from './useCase'

export default function createPrivacyPolicyUseCase(db: RdbClient): UseCase {
  return new UseCase(new QueryServiceImpl(db), new CommandServiceImpl(db))
}
