import {
  index,
  layout,
  prefix,
  type RouteConfig,
  RouteConfigEntry,
  route,
} from '@react-router/dev/routes'

const PATH_INDEX = '/'

interface GroupRoute {
  prefix: string
  layout?: string
  routes: Route[]
}

interface Route {
  path: string
  file: `./routes/${string}.tsx`
}

const baseGroup: GroupRoute = {
  prefix: '',
  routes: [
    { path: PATH_INDEX, file: './routes/_index.tsx' },
    { path: '/login', file: './routes/login/route.tsx' },
    { path: '/signup', file: './routes/signup/route.tsx' },
  ],
}

const trendGroup: GroupRoute = {
  prefix: 'trends',
  layout: './routes/trends.tsx',
  routes: [{ path: PATH_INDEX, file: './routes/trends._index/route.tsx' }],
}

const adminGroup: GroupRoute = {
  prefix: 'admin',
  layout: './routes/admin._layout.tsx',
  routes: [
    { path: PATH_INDEX, file: './routes/admin._index.tsx' },
    { path: '/users', file: './routes/admin.users/route.tsx' },
  ],
}

function buildGroupRoute(group: GroupRoute): RouteConfigEntry[] {
  const routes = group.routes.map((value) =>
    value.path === PATH_INDEX ? index(value.file) : route(value.path, value.file),
  )
  const layoutRoutes = group.layout ? [layout(group.layout, routes)] : routes

  return group.prefix ? prefix(group.prefix, layoutRoutes) : layoutRoutes
}

const groupRoutes: GroupRoute[] = [baseGroup, trendGroup, adminGroup]

const routing = groupRoutes.flatMap(buildGroupRoute)
export default routing satisfies RouteConfig
