// @ts-expect-error - PrismaClientはビルド時に生成されるため、開発時は型が存在しない
import { PrismaClient as PrismaClientLocal } from '@prisma/client'
// @ts-expect-error - PrismaClientはビルド時に生成されるため、開発時は型が存在しない
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// 開発環境では標準クライアント、本番環境ではエッジクライアントを使用
// 参考：https://hono.dev/examples/prisma
export default function getRdbClient(databaseUrl: string): any {
  const isTest = process.env.NODE_ENV === 'test'
  if (process.env.NODE_ENV === 'development' || isTest) {
    const devPrisma = new (PrismaClientLocal as any)({
      datasourceUrl: databaseUrl,
      log: isTest ? ['error'] : ['query', 'warn', 'error'],
    })
    return devPrisma
  }

  // 実態としてPrismaClientが動作するはずだが
  // 型定義がないためanyでキャストした後で更にキャスト
  const edgePrisma = new (PrismaClient as any)({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate()) as any

  return edgePrisma
}

export type RdbClient = any
