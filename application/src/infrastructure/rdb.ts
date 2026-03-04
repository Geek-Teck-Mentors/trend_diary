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

  if (config.db) {
    const adapter = new PrismaD1(config.db)
    return new PrismaClient({
      // NOTE: adapter-d1と@prisma/clientの型バージョン差分を吸収
      adapter: adapter as never,
      log: isTest ? ['error'] : ['warn', 'error'],
    })
  }

  if (!config.databaseUrl) {
    throw new Error('Either D1 binding (db) or databaseUrl must be provided')
  }

  return new PrismaClient({
    datasourceUrl: config.databaseUrl,
    log: isTest ? ['error'] : ['warn', 'error'],
  })
}

export type RdbClient = ReturnType<typeof getRdbClient>
