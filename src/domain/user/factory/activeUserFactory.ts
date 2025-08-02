import { RdbClient } from '@/infrastructure/rdb'
import CommandServiceImpl from '../infrastructure/commandServiceImpl'
import QueryServiceImpl from '../infrastructure/queryServiceImpl'
import ActiveUserService from '../service/activeUserService'

export default function createActiveUserService(db: RdbClient): ActiveUserService {
  return new ActiveUserService(new QueryServiceImpl(db), new CommandServiceImpl(db))
}
