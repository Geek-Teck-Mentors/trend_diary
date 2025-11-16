export interface Permission {
  permissionId: number
  resource: string
  action: string
}

export interface Role {
  roleId: number
  displayName: string
  description: string | null
  createdAt: string
}

export interface RolesResponse {
  roles: Role[]
}

export interface PermissionsResponse {
  permissions: Permission[]
}

export interface RoleDetailResponse {
  role: Role
  permissions: Permission[]
}
