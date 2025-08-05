import { RdbClient } from '@/infrastructure/rdb'
import CommandServiceImpl from '../infrastructure/commandServiceImpl'
import QueryServiceImpl from '../infrastructure/queryServiceImpl'
import PrivacyPolicyService from '../service/privacyPolicyService'

export default function createPrivacyPolicyService(db: RdbClient): PrivacyPolicyService {
  return new PrivacyPolicyService(new QueryServiceImpl(db), new CommandServiceImpl(db))
}
