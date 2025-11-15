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
-- 既存のAPIエンドポイントを登録し、必要な権限を紐付ける

-- Endpointテーブルへの投入
INSERT INTO "public"."endpoints" (path, method) VALUES
  -- User API
  ('/user/me', 'GET'),
  ('/user', 'POST'),
  ('/user/login', 'POST'),
  ('/user/logout', 'DELETE'),

  -- Admin API
  ('/admin/users', 'GET'),
  ('/admin/users/:id', 'POST'),

  -- Auth V2 API (公開エンドポイント)
  ('/v2/auth/signup', 'POST'),
  ('/v2/auth/login', 'POST'),
  ('/v2/auth/logout', 'DELETE'),
  ('/v2/auth/me', 'GET'),

  -- Policy API
  ('/policies', 'GET'),
  ('/policies', 'POST'),
  ('/policies/:version', 'GET'),
  ('/policies/:version', 'PATCH'),
  ('/policies/:version', 'DELETE'),
  ('/policies/:version/clone', 'POST'),
  ('/policies/:version/activate', 'PATCH'),

  -- Article API
  ('/articles', 'GET'),
  ('/articles/:article_id/read', 'POST'),
  ('/articles/:article_id/unread', 'DELETE')
ON CONFLICT (path, method) DO NOTHING;

-- EndpointPermissionの紐付け
-- GET /user/me: user.read
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/user/me' AND e.method = 'GET'
  AND p.resource = 'user' AND p.action = 'read'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /admin/users: user.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/admin/users' AND e.method = 'GET'
  AND p.resource = 'user' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /admin/users/:id: user.grant_admin
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/admin/users/:id' AND e.method = 'POST'
  AND p.resource = 'user' AND p.action = 'grant_admin'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /policies: privacy_policy.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies' AND e.method = 'GET'
  AND p.resource = 'privacy_policy' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /policies: privacy_policy.create
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies' AND e.method = 'POST'
  AND p.resource = 'privacy_policy' AND p.action = 'create'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /policies/:version: privacy_policy.read
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies/:version' AND e.method = 'GET'
  AND p.resource = 'privacy_policy' AND p.action = 'read'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /policies/:version: privacy_policy.update
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies/:version' AND e.method = 'PATCH'
  AND p.resource = 'privacy_policy' AND p.action = 'update'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- DELETE /policies/:version: privacy_policy.delete
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies/:version' AND e.method = 'DELETE'
  AND p.resource = 'privacy_policy' AND p.action = 'delete'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /policies/:version/clone: privacy_policy.clone
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies/:version/clone' AND e.method = 'POST'
  AND p.resource = 'privacy_policy' AND p.action = 'clone'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- PATCH /policies/:version/activate: privacy_policy.activate
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/policies/:version/activate' AND e.method = 'PATCH'
  AND p.resource = 'privacy_policy' AND p.action = 'activate'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- GET /articles: article.list
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/articles' AND e.method = 'GET'
  AND p.resource = 'article' AND p.action = 'list'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- POST /articles/:article_id/read: article.mark_read
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/articles/:article_id/read' AND e.method = 'POST'
  AND p.resource = 'article' AND p.action = 'mark_read'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;

-- DELETE /articles/:article_id/unread: article.mark_unread
INSERT INTO "public"."endpoint_permissions" (endpoint_id, permission_id)
SELECT e.endpoint_id, p.permission_id
FROM "public"."endpoints" e
CROSS JOIN "public"."permissions" p
WHERE e.path = '/articles/:article_id/unread' AND e.method = 'DELETE'
  AND p.resource = 'article' AND p.action = 'mark_unread'
ON CONFLICT (endpoint_id, permission_id) DO NOTHING;
