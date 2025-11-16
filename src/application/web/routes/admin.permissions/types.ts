export type Permission = {
  permissionId: number
  resource: string
  action: string
}

export type PermissionsResponse = {
  permissions: Permission[]
}
