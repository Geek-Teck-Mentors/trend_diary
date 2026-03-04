import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'

type D1Database = import('@cloudflare/workers-types').D1Database

type RdbConfig = {
  db?: D1Database
  databaseUrl?: string
}

type RdbInput = string | RdbConfig

export default function getRdbClient(input: RdbInput) {
  const isTest = process.env.NODE_ENV === 'test'
  const config: RdbConfig = typeof input === 'string' ? { databaseUrl: input } : input
  const resolvedDatabaseUrl = config.databaseUrl ?? process.env.DATABASE_URL

  // INFO: E2E/ローカルSQLiteではDATABASE_URL(file:)を優先し、D1バインディングとの分離を防ぐ
  if (resolvedDatabaseUrl?.startsWith('file:')) {
    return new PrismaClient({
      datasourceUrl: resolvedDatabaseUrl,
      log: isTest ? ['error'] : ['warn', 'error'],
    })
  }

  if (config.db) {
    const adapter = new PrismaD1(config.db)
    return new PrismaClient({
      // TODO: @prisma/adapter-d1 と @prisma/client の型互換が揃ったら `as never` を削除する
      // NOTE: adapter-d1と@prisma/clientの型バージョン差分を吸収
      adapter: adapter as never,
      log: isTest ? ['error'] : ['warn', 'error'],
    })
  }

  if (!resolvedDatabaseUrl) {
    throw new Error('Either D1 binding (db) or databaseUrl must be provided')
  }

  return new PrismaClient({
    datasourceUrl: resolvedDatabaseUrl,
    log: isTest ? ['error'] : ['warn', 'error'],
  })
}

export type RdbClient = ReturnType<typeof getRdbClient>
