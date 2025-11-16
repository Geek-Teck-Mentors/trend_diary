import type { PermissionCommand, PermissionQuery } from './repository'

/**
 * 権限のCRUD操作を行うユースケース
 */
export class PermissionUseCase {
  constructor(
    private permissionQuery: PermissionQuery,
    private permissionCommand: PermissionCommand,
  ) {}

  getAllPermissions = () => this.permissionQuery.findAllPermissions()
  getPermissionById = (id: number) => this.permissionQuery.findPermissionById(id)
  createPermission = (input: Parameters<PermissionCommand['createPermission']>[0]) =>
    this.permissionCommand.createPermission(input)
  deletePermission = (id: number) => this.permissionCommand.deletePermission(id)
}
