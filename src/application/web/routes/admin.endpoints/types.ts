export type Endpoint = {
  endpointId: number
  path: string
  method: string
}

export type Permission = {
  permissionId: number
  resource: string
  action: string
}

export type EndpointsResponse = {
  endpoints: Endpoint[]
}

export type EndpointDetailResponse = {
  endpoint: Endpoint
  permissions: Permission[]
}

export type PermissionsResponse = {
  permissions: Permission[]
}
