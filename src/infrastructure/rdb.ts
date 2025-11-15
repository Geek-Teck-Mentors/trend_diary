import { PrismaClient as PrismaClientLocal } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// 開発環境では標準クライアント、本番環境ではエッジクライアントを使用
// 参考：https://hono.dev/examples/prisma
export default function getRdbClient(databaseUrl: string) {
  const isTest = process.env.NODE_ENV === 'test'
  if (process.env.NODE_ENV === 'development' || isTest) {
    const devPrisma = new PrismaClientLocal({
      datasourceUrl: databaseUrl,
      log: isTest ? ['error'] : ['query', 'warn', 'error'],
    })
    return devPrisma
  }

  // 実態としてPrismaClientが動作するはずだが
  // 型定義がないためanyでキャストした後で更にキャスト
  const edgePrisma = new PrismaClient({
    datasourceUrl: databaseUrl,
    // biome-ignore lint/suspicious/noExplicitAny: PrismaのEdgeクライアントの型定義が不十分なため
  }).$extends(withAccelerate()) as any

  return edgePrisma as PrismaClient
}

export type RdbClient = ReturnType<typeof getRdbClient>
