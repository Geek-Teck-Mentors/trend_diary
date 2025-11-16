import EndpointList from './components/endpoint-list'
import PermissionPanel from './components/permission-panel'
import type { Endpoint, Permission } from './types'

type Props = {
  endpoints: Endpoint[]
  permissions: Permission[]
  selectedEndpoint: Endpoint | null
  selectedEndpointPermissions: Permission[]
  loading: boolean
  selectedEndpointId: number | null
  onSelectEndpoint: (endpointId: number | null) => void
  onCreateEndpoint: (path: string, method: string) => Promise<void>
  onDeleteEndpoint: (id: number) => Promise<void>
  onUpdatePermissions: (permissionIds: number[]) => Promise<void>
}

export default function AdminEndpointsPage({
  endpoints,
  permissions,
  selectedEndpoint,
  selectedEndpointPermissions,
  loading,
  selectedEndpointId,
  onSelectEndpoint,
  onCreateEndpoint,
  onDeleteEndpoint,
  onUpdatePermissions,
}: Props) {
  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-gray-500'>読み込み中...</p>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>エンドポイント管理</h2>
        <p className='text-gray-500 mt-1'>APIエンドポイントと必要な権限を管理します</p>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='flex h-[calc(100vh-16rem)]'>
          <EndpointList
            endpoints={endpoints}
            selectedEndpointId={selectedEndpointId}
            onSelectEndpoint={onSelectEndpoint}
            onCreateEndpoint={onCreateEndpoint}
            onDeleteEndpoint={onDeleteEndpoint}
          />
          <PermissionPanel
            selectedEndpoint={selectedEndpoint}
            allPermissions={permissions}
            selectedEndpointPermissions={selectedEndpointPermissions}
            onUpdatePermissions={onUpdatePermissions}
          />
        </div>
      </div>
    </div>
  )
}
