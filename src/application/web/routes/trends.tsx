import { LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import AppHeader from '../components/AppHeader'
import AppSidebar from '../components/Sidebar'
import { SidebarProvider } from '../components/ui/sidebar'
import { isUserFeatureEnabled } from '../features/featureFlag'

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env
  return {
    userFeatureEnabled: isUserFeatureEnabled(env),
  }
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  // TODO: displayNameの取得はサーバーサイドのloaderで実施
  const displayName = ''
  const { userFeatureEnabled } = useLoaderData<typeof loader>()

  return (
    <SidebarProvider>
      <AppSidebar displayName={displayName} userFeatureEnabled={userFeatureEnabled} />
      <div className='w-full'>
        <AppHeader displayName={displayName} userFeatureEnabled={userFeatureEnabled} />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
