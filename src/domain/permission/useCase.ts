import { AsyncResult, isFailure, success } from '@yuukihayashi0510/core'
import type {
  EndpointCommand,
  EndpointPermissionCommand,
  EndpointQuery,
  PermissionCommand,
  PermissionQuery,
  RoleCommand,
  RolePermissionCommand,
  RoleQuery,
} from './repository'

/**
 * パーミッション管理のユースケース
 */
export class UseCase {
  constructor(
    private permissionQuery: PermissionQuery,
    private permissionCommand: PermissionCommand,
    private roleQuery: RoleQuery,
    private roleCommand: RoleCommand,
    private rolePermissionCommand: RolePermissionCommand,
    private endpointQuery: EndpointQuery,
    private endpointCommand: EndpointCommand,
    private endpointPermissionCommand: EndpointPermissionCommand,
  ) {}

  /**
   * ユーザーがエンドポイントにアクセスできるか判定
   * @param activeUserId ユーザーID
   * @param path エンドポイントパス
   * @param method HTTPメソッド
   * @returns アクセスできる場合true
   */
  async hasEndpointPermission(
    activeUserId: bigint,
    path: string,
    method: string,
  ): AsyncResult<boolean, Error> {
    const requiredPermissionsResult = await this.permissionQuery.getRequiredPermissionsByEndpoint(
      path,
      method,
    )
    if (isFailure(requiredPermissionsResult)) {
      return requiredPermissionsResult
    }

    if (requiredPermissionsResult.data.length === 0) {
      return success(false)
    }

    const userPermissionsResult = await this.permissionQuery.getUserPermissions(activeUserId)
    if (isFailure(userPermissionsResult)) {
      return userPermissionsResult
    }

    const hasAllPermissions = requiredPermissionsResult.data.every((required) =>
      userPermissionsResult.data.some(
        (userPerm) => userPerm.permissionId === required.permissionId,
      ),
    )

    return success(hasAllPermissions)
  }

  // Permission関連メソッドをエクスポート
  getAllPermissions = () => this.permissionQuery.findAllPermissions()
  getPermissionById = (id: number) => this.permissionQuery.findPermissionById(id)
  createPermission = (input: Parameters<PermissionCommand['createPermission']>[0]) =>
    this.permissionCommand.createPermission(input)
  deletePermission = (id: number) => this.permissionCommand.deletePermission(id)

  // Role関連メソッドをエクスポート
  getAllRoles = () => this.roleQuery.findAllRoles()
  getRoleById = (id: number) => this.roleQuery.findRoleById(id)
  getPermissionsByRoleId = (roleId: number) => this.roleQuery.findPermissionsByRoleId(roleId)
  createRole = (input: Parameters<RoleCommand['createRole']>[0]) =>
    this.roleCommand.createRole(input)
  updateRole = (id: number, input: Parameters<RoleCommand['updateRole']>[1]) =>
    this.roleCommand.updateRole(id, input)
  deleteRole = (id: number) => this.roleCommand.deleteRole(id)

  // RolePermission関連メソッドをエクスポート
  grantPermissionToRole = (input: Parameters<RolePermissionCommand['grantPermissionToRole']>[0]) =>
    this.rolePermissionCommand.grantPermissionToRole(input)
  revokePermissionFromRole = (
    input: Parameters<RolePermissionCommand['revokePermissionFromRole']>[0],
  ) => this.rolePermissionCommand.revokePermissionFromRole(input)
  updateRolePermissions = (roleId: number, permissionIds: number[]) =>
    this.rolePermissionCommand.updateRolePermissions(roleId, permissionIds)

  // Endpoint関連メソッドをエクスポート
  getAllEndpoints = () => this.endpointQuery.findAllEndpoints()
  getEndpointById = (id: number) => this.endpointQuery.findEndpointById(id)
  getPermissionsByEndpointId = (endpointId: number) =>
    this.endpointQuery.findPermissionsByEndpointId(endpointId)
  createEndpoint = (input: Parameters<EndpointCommand['createEndpoint']>[0]) =>
    this.endpointCommand.createEndpoint(input)
  deleteEndpoint = (id: number) => this.endpointCommand.deleteEndpoint(id)

  // EndpointPermission関連メソッドをエクスポート
  grantPermissionToEndpoint = (
    input: Parameters<EndpointPermissionCommand['grantPermissionToEndpoint']>[0],
  ) => this.endpointPermissionCommand.grantPermissionToEndpoint(input)
  revokePermissionFromEndpoint = (
    input: Parameters<EndpointPermissionCommand['revokePermissionFromEndpoint']>[0],
  ) => this.endpointPermissionCommand.revokePermissionFromEndpoint(input)
  updateEndpointPermissions = (endpointId: number, permissionIds: number[]) =>
    this.endpointPermissionCommand.updateEndpointPermissions(endpointId, permissionIds)
}
