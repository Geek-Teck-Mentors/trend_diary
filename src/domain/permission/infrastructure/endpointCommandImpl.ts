import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import type { EndpointCommand } from '../repository'
import type { Endpoint, EndpointInput } from '../schema/endpointSchema'

export class EndpointCommandImpl implements EndpointCommand {
  constructor(private rdb: PrismaClient) {}

  async createEndpoint(input: EndpointInput): AsyncResult<Endpoint, Error> {
    try {
      // 既存チェック
      const existing = await this.rdb.endpoint.findUnique({
        where: {
          path_method: {
            path: input.path,
            method: input.method,
          },
        },
      })

      if (existing) {
        return failure(new AlreadyExistsError('同じパスとメソッドのエンドポイントが既に存在します'))
      }

      const endpoint = await this.rdb.endpoint.create({
        data: {
          path: input.path,
          method: input.method,
        },
      })

      return success({
        endpointId: endpoint.endpointId,
        path: endpoint.path,
        method: endpoint.method,
        createdAt: endpoint.createdAt,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイントの作成に失敗: ${message}`))
    }
  }

  async deleteEndpoint(endpointId: number): AsyncResult<void, Error> {
    try {
      const existing = await this.rdb.endpoint.findUnique({
        where: { endpointId },
      })

      if (!existing) {
        return failure(new NotFoundError('エンドポイントが見つかりません'))
      }

      await this.rdb.endpoint.delete({
        where: { endpointId },
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイントの削除に失敗: ${message}`))
    }
  }
}
