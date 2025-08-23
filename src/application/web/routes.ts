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
  readonly prefix: string
  readonly layout?: string
  readonly routes: Route[]
}

interface Route {
  readonly path: string
  readonly file: `./routes/${string}.tsx`
}

const baseGroup = {
  prefix: '',
  routes: [
    { path: PATH_INDEX, file: './routes/_index.tsx' },
    { path: '/login', file: './routes/login/route.tsx' },
    { path: '/signup', file: './routes/signup/route.tsx' },
  ],
} as const satisfies GroupRoute

const trendGroup = {
  prefix: 'trends',
  layout: './routes/trends.tsx',
  routes: [{ path: PATH_INDEX, file: './routes/trends._index/route.tsx' }],
} as const satisfies GroupRoute

const adminGroup = {
  prefix: 'admin',
  layout: './routes/admin._layout.tsx',
  routes: [
    { path: PATH_INDEX, file: './routes/admin._index.tsx' },
    { path: '/users', file: './routes/admin.users/route.tsx' },
  ],
} as const satisfies GroupRoute

function buildGroupRoute(group: GroupRoute): RouteConfigEntry[] {
  const routes = group.routes.map((value) =>
    value.path === PATH_INDEX ? index(value.file) : route(value.path, value.file),
  )
  const layoutRoutes = group.layout ? [layout(group.layout, routes)] : routes

  return group.prefix ? prefix(group.prefix, layoutRoutes) : layoutRoutes
}

const groupRoutes = [baseGroup, trendGroup, adminGroup] as const satisfies GroupRoute[]

const routing: RouteConfig = groupRoutes.flatMap(buildGroupRoute)
export default routing

/**
 * CombinePrefix<P, Path>
 *
 * グループの prefix (P) とルートの path (Path) を結合して
 * 実際のパス文字列リテラルを生成するユーティリティ型。
 *
 * 型の振る舞い:
 * - Path が '/' の場合（インデックスルート）
 *   - P === '' -> '/'
 *   - P !== '' -> `/${P}` (末尾スラッシュなし)
 *
 * - Path が '/<Rest>' の場合
 *   - P === '' -> `/${Rest}`
 *   - P !== '' -> `/${P}/${Rest}`
 *
 * - それ以外の形式の Path は `never` を返す（未想定のパターン）
 *
 * 注意:
 * - `groupRoutes` の値は `as const` にしてリテラル型を保持すること。
 * - `prefix` および `path` は文字列リテラルとして評価される必要がある。
 *
 * @template P グループの prefix（例: 'admin' または ''）
 * @template Path ルートの path（例: '/' または '/users'）
 */
type CombinePrefix<P extends string, Path extends string> = Path extends '/'
  ? P extends ''
    ? '/'
    : `/${P}`
  : Path extends `/${infer Rest}`
    ? P extends ''
      ? `/${Rest}`
      : `/${P}/${Rest}`
    : never

/**
 * Paths<T>
 *
 * groupRoutes の型から全てのパス文字列リテラルのユニオンを生成する型。
 * - T は group の配列型（readonly を含む）であることを想定する。
 * - 各要素は { prefix: P, routes: Array<{ path: Path }> } の形であること。
 *
 * 生成される型例:
 * '/' | '/login' | '/signup' | '/trends' | '/admin' | '/admin/users'
 *
 * @template T groupRoutes のリテラル配列型
 */
type Paths<T extends readonly any[]> = T[number] extends infer Item
  ? Item extends { prefix: infer P extends string; routes: infer R extends readonly any[] }
    ? R[number] extends { path: infer Path extends string }
      ? CombinePrefix<P, Path>
      : never
    : never
  : never

/**
 * InternalPath
 *
 * 実際にアプリケーションで使用されるパスのユニオン型。
 * `groupRoutes` を `as const` のまま保持していることで具体的なリテラルが推論される。
 */
export type InternalPath = Paths<typeof groupRoutes>
