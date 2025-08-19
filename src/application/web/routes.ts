import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),
  layout('./routes/trends.tsx', [route('/trends', './routes/trends._index/route.tsx')]),

  route('/login', './routes/login/route.tsx'),
  route('/signup', './routes/signup/route.tsx'),

  layout('./routes/admin._layout.tsx', [
    route('/admin', './routes/admin._index.tsx'),
    route('/admin/users', './routes/admin.users/route.tsx'),
  ]),
] satisfies RouteConfig
