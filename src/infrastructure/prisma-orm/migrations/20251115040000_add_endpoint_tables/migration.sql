-- CreateTable
CREATE TABLE "public"."endpoints" (
    "endpoint_id" SERIAL NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "endpoints_pkey" PRIMARY KEY ("endpoint_id")
);

-- CreateTable
CREATE TABLE "public"."endpoint_permissions" (
    "endpoint_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "endpoint_permissions_pkey" PRIMARY KEY ("endpoint_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "endpoints_path_method_key" ON "public"."endpoints"("path", "method");

-- CreateIndex
CREATE INDEX "endpoints_path_method_idx" ON "public"."endpoints"("path", "method");

-- CreateIndex
CREATE INDEX "endpoint_permissions_permission_id_idx" ON "public"."endpoint_permissions"("permission_id");

-- AddForeignKey
ALTER TABLE "public"."endpoint_permissions" ADD CONSTRAINT "endpoint_permissions_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "public"."endpoints"("endpoint_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."endpoint_permissions" ADD CONSTRAINT "endpoint_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add table comments
COMMENT ON TABLE "public"."endpoints" IS 'エンドポイントテーブル：APIエンドポイントのパスとHTTPメソッドを管理';
COMMENT ON TABLE "public"."endpoint_permissions" IS 'エンドポイント・パーミッション中間テーブル：エンドポイントが要求する権限を管理';

-- Add column comments for endpoints
COMMENT ON COLUMN "public"."endpoints"."endpoint_id" IS 'エンドポイントID：プライマリキー';
COMMENT ON COLUMN "public"."endpoints"."path" IS 'パス：APIエンドポイントのパス（例：/api/articles、/api/articles/:id）';
COMMENT ON COLUMN "public"."endpoints"."method" IS 'HTTPメソッド：GET、POST、PUT、DELETE等';
COMMENT ON COLUMN "public"."endpoints"."created_at" IS '作成日時：エンドポイントが登録された日時';

-- Add column comments for endpoint_permissions
COMMENT ON COLUMN "public"."endpoint_permissions"."endpoint_id" IS 'エンドポイントID：外部キー';
COMMENT ON COLUMN "public"."endpoint_permissions"."permission_id" IS 'パーミッションID：外部キー';
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
  ('permission', 'read'),
  ('permission', 'create'),
  ('permission', 'delete'),

  -- エンドポイント管理
  ('endpoint', 'list'),
  ('endpoint', 'read'),
  ('endpoint', 'create'),
  ('endpoint', 'delete'),
  ('endpoint', 'update')
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
    OR (p.resource = 'role' AND p.action IN ('list', 'read', 'create', 'update', 'delete', 'assign', 'revoke'))
    -- パーミッション
    OR (p.resource = 'permission' AND p.action IN ('list', 'read', 'create', 'delete'))
    -- エンドポイント
    OR (p.resource = 'endpoint' AND p.action IN ('list', 'read', 'create', 'delete', 'update'))
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
  ('/api/policies/:version/activate', 'PATCH'),

  -- Permission API
  ('/api/admin/permissions', 'GET'),
  ('/api/admin/permissions', 'POST'),
  ('/api/admin/permissions/:id', 'DELETE'),

  -- Role API
  ('/api/admin/roles', 'GET'),
  ('/api/admin/roles/:id', 'GET'),
  ('/api/admin/roles', 'POST'),
  ('/api/admin/roles/:id', 'PATCH'),
  ('/api/admin/roles/:id', 'DELETE'),
  ('/api/admin/roles/:id/permissions', 'PATCH'),

  -- Endpoint API
  ('/api/admin/endpoints', 'GET'),
  ('/api/admin/endpoints/:id', 'GET'),
  ('/api/admin/endpoints', 'POST'),
  ('/api/admin/endpoints/:id', 'DELETE'),
  ('/api/admin/endpoints/:id/permissions', 'PATCH')
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

-- Permission API endpoints
-- GET /api/admin/permissions: permission.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/permissions' AND e.method = 'GET'
  AND p.resource = 'permission' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /api/admin/permissions: permission.create
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/permissions' AND e.method = 'POST'
  AND p.resource = 'permission' AND p.action = 'create'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- DELETE /api/admin/permissions/:id: permission.delete
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/permissions/:id' AND e.method = 'DELETE'
  AND p.resource = 'permission' AND p.action = 'delete'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- Role API endpoints
-- GET /api/admin/roles: role.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/roles' AND e.method = 'GET'
  AND p.resource = 'role' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /api/admin/roles/:id: role.read
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/roles/:id' AND e.method = 'GET'
  AND p.resource = 'role' AND p.action = 'read'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /api/admin/roles: role.create
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/roles' AND e.method = 'POST'
  AND p.resource = 'role' AND p.action = 'create'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /api/admin/roles/:id: role.update
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/roles/:id' AND e.method = 'PATCH'
  AND p.resource = 'role' AND p.action = 'update'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- DELETE /api/admin/roles/:id: role.delete
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/roles/:id' AND e.method = 'DELETE'
  AND p.resource = 'role' AND p.action = 'delete'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /api/admin/roles/:id/permissions: role.update (権限の割り当てもupdateと見なす)
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/roles/:id/permissions' AND e.method = 'PATCH'
  AND p.resource = 'role' AND p.action = 'update'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- Endpoint API endpoints
-- GET /api/admin/endpoints: endpoint.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/endpoints' AND e.method = 'GET'
  AND p.resource = 'endpoint' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /api/admin/endpoints/:id: endpoint.read
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/endpoints/:id' AND e.method = 'GET'
  AND p.resource = 'endpoint' AND p.action = 'read'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /api/admin/endpoints: endpoint.create
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/endpoints' AND e.method = 'POST'
  AND p.resource = 'endpoint' AND p.action = 'create'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- DELETE /api/admin/endpoints/:id: endpoint.delete
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/endpoints/:id' AND e.method = 'DELETE'
  AND p.resource = 'endpoint' AND p.action = 'delete'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /api/admin/endpoints/:id/permissions: endpoint.update
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/api/admin/endpoints/:id/permissions' AND e.method = 'PATCH'
  AND p.resource = 'endpoint' AND p.action = 'update'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;
