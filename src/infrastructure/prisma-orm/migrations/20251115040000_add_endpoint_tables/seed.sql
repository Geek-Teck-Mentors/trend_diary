-- パーミッション（権限）のシードデータ
-- ON CONFLICT で冪等性を保証（既に存在する場合はスキップ）

-- Permissionテーブルへの投入
INSERT INTO "public"."permissions" (resource, action) VALUES
  -- ユーザー管理
  ('user', 'list'),
  ('user', 'read'),
  ('user', 'grant_admin'),

  -- 記事
  ('article', 'list'),
  ('article', 'mark_read'),
  ('article', 'mark_unread'),

  -- プライバシーポリシー
  ('privacy_policy', 'list'),
  ('privacy_policy', 'read'),
  ('privacy_policy', 'create'),
  ('privacy_policy', 'update'),
  ('privacy_policy', 'delete'),
  ('privacy_policy', 'clone'),
  ('privacy_policy', 'activate'),

  -- ロール管理
  ('role', 'list'),
  ('role', 'read'),
  ('role', 'create'),
  ('role', 'update'),
  ('role', 'delete'),
  ('role', 'assign'),
  ('role', 'revoke'),

  -- パーミッション管理
  ('permission', 'list'),
  ('permission', 'read')
ON CONFLICT (resource, action) DO NOTHING;

-- Roleテーブルへの投入
INSERT INTO "public"."roles" (display_name, description) VALUES
  ('スーパー管理者', 'すべての権限を持つ最高管理者'),
  ('管理者', 'ユーザー管理・ポリシー管理が可能'),
  ('一般ユーザー', '基本的な機能が利用可能')
ON CONFLICT (display_name) DO NOTHING;

-- RolePermissionの紐付け（スーパー管理者：すべての権限）
INSERT INTO "public"."role_permissions" (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM "public"."roles" r
CROSS JOIN "public"."permissions" p
WHERE r.display_name = 'スーパー管理者'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- RolePermissionの紐付け（管理者）
INSERT INTO "public"."role_permissions" (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM "public"."roles" r
CROSS JOIN "public"."permissions" p
WHERE r.display_name = '管理者'
  AND (
    -- ユーザー
    (p.resource = 'user' AND p.action IN ('list', 'read', 'grant_admin'))
    -- 記事
    OR (p.resource = 'article' AND p.action IN ('list', 'mark_read', 'mark_unread'))
    -- プライバシーポリシー
    OR (p.resource = 'privacy_policy' AND p.action IN ('list', 'read', 'create', 'update', 'delete', 'clone', 'activate'))
    -- ロール
    OR (p.resource = 'role' AND p.action IN ('list', 'read', 'assign', 'revoke'))
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- RolePermissionの紐付け（一般ユーザー）
INSERT INTO "public"."role_permissions" (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM "public"."roles" r
CROSS JOIN "public"."permissions" p
WHERE r.display_name = '一般ユーザー'
  AND (
    -- ユーザー
    (p.resource = 'user' AND p.action = 'read')
    -- 記事
    OR (p.resource = 'article' AND p.action IN ('list', 'mark_read', 'mark_unread'))
    -- プライバシーポリシー
    OR (p.resource = 'privacy_policy' AND p.action IN ('list', 'read'))
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- エンドポイントのシードデータ
-- 権限チェックが必要なエンドポイントのみ登録
-- 公開エンドポイント（認証不要）や認証のみ必須のエンドポイントはルート定義で制御するため登録しない

-- Endpointテーブルへの投入
INSERT INTO "public"."endpoints" (path, method) VALUES
  -- Admin API（権限チェック必須）
  ('/api/admin/users', 'GET'),
  ('/api/admin/users/:id', 'POST'),

  -- Policy API（権限チェック必須）
  ('/api/policies', 'GET'),
  ('/api/policies', 'POST'),
  ('/api/policies/:version', 'GET'),
  ('/api/policies/:version', 'PATCH'),
  ('/api/policies/:version', 'DELETE'),
  ('/api/policies/:version/clone', 'POST'),
  ('/api/policies/:version/activate', 'PATCH')
ON CONFLICT (path, method) DO NOTHING;

-- EndpointPermissionの紐付け

-- GET /admin/users: user.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/users' AND e.method = 'GET'
  AND p.resource = 'user' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /admin/users/:id: user.grant_admin
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/users/:id' AND e.method = 'POST'
  AND p.resource = 'user' AND p.action = 'grant_admin'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /policies: privacy_policy.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies' AND e.method = 'GET'
  AND p.resource = 'privacy_policy' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /policies: privacy_policy.create
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies' AND e.method = 'POST'
  AND p.resource = 'privacy_policy' AND p.action = 'create'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /policies/:version: privacy_policy.read
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies/:version' AND e.method = 'GET'
  AND p.resource = 'privacy_policy' AND p.action = 'read'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /policies/:version: privacy_policy.update
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies/:version' AND e.method = 'PATCH'
  AND p.resource = 'privacy_policy' AND p.action = 'update'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- DELETE /policies/:version: privacy_policy.delete
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies/:version' AND e.method = 'DELETE'
  AND p.resource = 'privacy_policy' AND p.action = 'delete'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /policies/:version/clone: privacy_policy.clone
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies/:version/clone' AND e.method = 'POST'
  AND p.resource = 'privacy_policy' AND p.action = 'clone'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /policies/:version/activate: privacy_policy.activate
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/policies/:version/activate' AND e.method = 'PATCH'
  AND p.resource = 'privacy_policy' AND p.action = 'activate'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;
