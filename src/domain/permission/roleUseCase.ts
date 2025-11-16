import type { RoleCommand, RolePermissionCommand, RoleQuery } from './repository'

/**
 * ロールのCRUD操作とロール-権限の紐付けを行うユースケース
 */
export class RoleUseCase {
  constructor(
    private roleQuery: RoleQuery,
    private roleCommand: RoleCommand,
    private rolePermissionCommand: RolePermissionCommand,
  ) {}

  // Role CRUD
  getAllRoles = () => this.roleQuery.findAllRoles()
  getRoleById = (id: number) => this.roleQuery.findRoleById(id)
  getPermissionsByRoleId = (roleId: number) => this.roleQuery.findPermissionsByRoleId(roleId)
  createRole = (input: Parameters<RoleCommand['createRole']>[0]) =>
    this.roleCommand.createRole(input)
  updateRole = (id: number, input: Parameters<RoleCommand['updateRole']>[1]) =>
    this.roleCommand.updateRole(id, input)
  deleteRole = (id: number) => this.roleCommand.deleteRole(id)

  // RolePermission管理
  grantPermissionToRole = (input: Parameters<RolePermissionCommand['grantPermissionToRole']>[0]) =>
    this.rolePermissionCommand.grantPermissionToRole(input)
  revokePermissionFromRole = (
    input: Parameters<RolePermissionCommand['revokePermissionFromRole']>[0],
  ) => this.rolePermissionCommand.revokePermissionFromRole(input)
  updateRolePermissions = (roleId: number, permissionIds: number[]) =>
    this.rolePermissionCommand.updateRolePermissions(roleId, permissionIds)
}
