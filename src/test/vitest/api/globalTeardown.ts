import { disconnectTestRdb } from '@/test/helper/rdb'

export default async function globalTeardown() {
  await disconnectTestRdb()
}
