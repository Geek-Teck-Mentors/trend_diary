import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'
import type { EndpointQuery } from '../repository'
import type { Endpoint } from '../schema/endpointSchema'
import type { Permission } from '../schema/permissionSchema'

export class EndpointQueryImpl implements EndpointQuery {
  constructor(private rdb: PrismaClient) {}

  async findAllEndpoints(): AsyncResult<Endpoint[], Error> {
    try {
      const endpoints = await this.rdb.endpoint.findMany({
        orderBy: [{ path: 'asc' }, { method: 'asc' }],
      })

      return success(
        endpoints.map((e) => ({
          endpointId: e.endpointId,
          path: e.path,
          method: e.method,
          createdAt: e.createdAt,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイント一覧の取得に失敗: ${message}`))
    }
  }

  async findEndpointById(endpointId: number): AsyncResult<Nullable<Endpoint>, Error> {
    try {
      const endpoint = await this.rdb.endpoint.findUnique({
        where: { endpointId },
      })

      if (!endpoint) {
        return success(null)
      }

      return success({
        endpointId: endpoint.endpointId,
        path: endpoint.path,
        method: endpoint.method,
        createdAt: endpoint.createdAt,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイントの取得に失敗: ${message}`))
    }
  }

  async findPermissionsByEndpointId(endpointId: number): AsyncResult<Permission[], Error> {
    try {
      const endpointPermissions = await this.rdb.endpointPermission.findMany({
        where: { endpointId },
        include: {
          permission: true,
        },
        orderBy: [{ permission: { resource: 'asc' } }, { permission: { action: 'asc' } }],
      })

      return success(
        endpointPermissions.map((ep) => ({
          permissionId: ep.permission.permissionId,
          resource: ep.permission.resource,
          action: ep.permission.action,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイントのパーミッション取得に失敗: ${message}`))
    }
  }
}
