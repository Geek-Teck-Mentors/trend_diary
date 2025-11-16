import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { AlreadyExistsError, NotFoundError, ServerError } from '@/common/errors'
import type { EndpointPermissionCommand } from '../repository'
import type {
  EndpointPermission,
  EndpointPermissionInput,
} from '../schema/endpointPermissionSchema'

export class EndpointPermissionCommandImpl implements EndpointPermissionCommand {
  constructor(private rdb: PrismaClient) {}

  async grantPermissionToEndpoint(
    input: EndpointPermissionInput,
  ): AsyncResult<EndpointPermission, Error> {
    try {
      // エンドポイントの存在確認
      const endpoint = await this.rdb.endpoint.findUnique({
        where: { endpointId: input.endpointId },
      })
      if (!endpoint) {
        return failure(new NotFoundError('エンドポイントが見つかりません'))
      }

      // パーミッションの存在確認
      const permission = await this.rdb.permission.findUnique({
        where: { permissionId: input.permissionId },
      })
      if (!permission) {
        return failure(new NotFoundError('パーミッションが見つかりません'))
      }

      // 既存チェック
      const existing = await this.rdb.endpointPermission.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          endpointId_permissionId: {
            endpointId: input.endpointId,
            permissionId: input.permissionId,
          },
        },
      })
      if (existing) {
        return failure(new AlreadyExistsError('既にこのパーミッションが付与されています'))
      }

      const endpointPermission = await this.rdb.endpointPermission.create({
        data: {
          endpointId: input.endpointId,
          permissionId: input.permissionId,
        },
      })

      return success({
        endpointId: endpointPermission.endpointId,
        permissionId: endpointPermission.permissionId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの付与に失敗: ${message}`))
    }
  }

  async revokePermissionFromEndpoint(input: EndpointPermissionInput): AsyncResult<void, Error> {
    try {
      const existing = await this.rdb.endpointPermission.findUnique({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          endpointId_permissionId: {
            endpointId: input.endpointId,
            permissionId: input.permissionId,
          },
        },
      })

      if (!existing) {
        return failure(new NotFoundError('このパーミッションは付与されていません'))
      }

      await this.rdb.endpointPermission.delete({
        where: {
          // biome-ignore lint/style/useNamingConvention: Prisma generated composite key name
          endpointId_permissionId: {
            endpointId: input.endpointId,
            permissionId: input.permissionId,
          },
        },
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`パーミッションの削除に失敗: ${message}`))
    }
  }

  async updateEndpointPermissions(
    endpointId: number,
    permissionIds: number[],
  ): AsyncResult<void, Error> {
    try {
      // エンドポイントの存在確認
      const endpoint = await this.rdb.endpoint.findUnique({
        where: { endpointId },
      })
      if (!endpoint) {
        return failure(new NotFoundError('エンドポイントが見つかりません'))
      }

      // トランザクションで一括更新
      await this.rdb.$transaction(async (tx) => {
        // 既存のパーミッションを全削除
        await tx.endpointPermission.deleteMany({
          where: { endpointId },
        })

        // 新しいパーミッションを追加
        if (permissionIds.length > 0) {
          await tx.endpointPermission.createMany({
            data: permissionIds.map((permissionId) => ({
              endpointId,
              permissionId,
            })),
          })
        }
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`エンドポイントパーミッションの更新に失敗: ${message}`))
    }
  }
}
