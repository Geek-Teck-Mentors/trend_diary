import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),
  // TODO: アカウントが必要な機能ができてから有効化する
  // route('/login', './routes/login/route.tsx'),
  // route('/signup', './routes/signup/route.tsx'),

  layout('./routes/trends.tsx', [route('/trends', './routes/trends._index/route.tsx')]),
] satisfies RouteConfig
