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