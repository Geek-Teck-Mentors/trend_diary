import type { EndpointCommand, EndpointPermissionCommand, EndpointQuery } from './repository'

/**
 * エンドポイントのCRUD操作とエンドポイント-権限の紐付けを行うユースケース
 */
export class EndpointUseCase {
  constructor(
    private endpointQuery: EndpointQuery,
    private endpointCommand: EndpointCommand,
    private endpointPermissionCommand: EndpointPermissionCommand,
  ) {}

  // Endpoint CRUD
  getAllEndpoints = () => this.endpointQuery.findAllEndpoints()
  getEndpointById = (id: number) => this.endpointQuery.findEndpointById(id)
  getPermissionsByEndpointId = (endpointId: number) =>
    this.endpointQuery.findPermissionsByEndpointId(endpointId)
  createEndpoint = (input: Parameters<EndpointCommand['createEndpoint']>[0]) =>
    this.endpointCommand.createEndpoint(input)
  deleteEndpoint = (id: number) => this.endpointCommand.deleteEndpoint(id)

  // EndpointPermission管理
  grantPermissionToEndpoint = (
    input: Parameters<EndpointPermissionCommand['grantPermissionToEndpoint']>[0],
  ) => this.endpointPermissionCommand.grantPermissionToEndpoint(input)
  revokePermissionFromEndpoint = (
    input: Parameters<EndpointPermissionCommand['revokePermissionFromEndpoint']>[0],
  ) => this.endpointPermissionCommand.revokePermissionFromEndpoint(input)
  updateEndpointPermissions = (endpointId: number, permissionIds: number[]) =>
    this.endpointPermissionCommand.updateEndpointPermissions(endpointId, permissionIds)
}
