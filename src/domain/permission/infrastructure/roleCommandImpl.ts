import { PrismaClient } from '@prisma/client'
import { AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { NotFoundError, ServerError } from '@/common/errors'
import type { RoleCommand } from '../repository'
import type { Role, RoleInput, RoleUpdate } from '../schema/roleSchema'

export class RoleCommandImpl implements RoleCommand {
  constructor(private rdb: PrismaClient) {}

  async createRole(input: RoleInput): AsyncResult<Role, Error> {
    try {
      const role = await this.rdb.role.create({
        data: {
          displayName: input.displayName,
          description: input.description,
        },
      })

      return success({
        roleId: role.roleId,
        displayName: role.displayName,
        description: role.description,
        createdAt: role.createdAt,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロールの作成に失敗: ${message}`))
    }
  }

  async updateRole(roleId: number, input: RoleUpdate): AsyncResult<Role, Error> {
    try {
      const existing = await this.rdb.role.findUnique({
        where: { roleId },
      })

      if (!existing) {
        return failure(new NotFoundError('ロールが見つかりません'))
      }

      const role = await this.rdb.role.update({
        where: { roleId },
        data: {
          displayName: input.displayName,
          description: input.description,
        },
      })

      return success({
        roleId: role.roleId,
        displayName: role.displayName,
        description: role.description,
        createdAt: role.createdAt,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロールの更新に失敗: ${message}`))
    }
  }

  async deleteRole(roleId: number): AsyncResult<void, Error> {
    try {
      const existing = await this.rdb.role.findUnique({
        where: { roleId },
      })

      if (!existing) {
        return failure(new NotFoundError('ロールが見つかりません'))
      }

      await this.rdb.role.delete({
        where: { roleId },
      })

      return success(undefined)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return failure(new ServerError(`ロールの削除に失敗: ${message}`))
    }
  }
}
