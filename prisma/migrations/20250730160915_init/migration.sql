-- CreateTable
CREATE TABLE "active_users" (
    "active_user_id" BIGSERIAL NOT NULL,
    "email" VARCHAR(1024) NOT NULL,
    "password" VARCHAR(1024) NOT NULL,
    "display_name" VARCHAR(1024),
    "last_login" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "active_users_pkey" PRIMARY KEY ("active_user_id")
);

-- CreateTable
CREATE TABLE "articles" (
    "article_id" BIGSERIAL NOT NULL,
    "media" VARCHAR(10) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "author" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "banned_users" (
    "user_id" BIGINT NOT NULL,
    "banned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(1024),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "leaved_users" (
    "user_id" BIGINT NOT NULL,
    "reason" VARCHAR(1024),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "read_histories" (
    "read_history_id" BIGSERIAL NOT NULL,
    "read_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "article_id" BIGINT NOT NULL,
    "active_user_id" BIGINT NOT NULL,

    CONSTRAINT "read_histories_pkey" PRIMARY KEY ("read_history_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" VARCHAR(255) NOT NULL,
    "session_token" VARCHAR(255),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active_user_id" BIGINT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_users_email_key" ON "active_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "active_users_user_id_key" ON "active_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "banned_users_user_id_key" ON "banned_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "leaved_users_user_id_key" ON "leaved_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_active_user_id_key" ON "sessions"("active_user_id");

-- AddForeignKey
ALTER TABLE "active_users" ADD CONSTRAINT "active_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banned_users" ADD CONSTRAINT "banned_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaved_users" ADD CONSTRAINT "leaved_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_histories" ADD CONSTRAINT "read_histories_active_user_id_fkey" FOREIGN KEY ("active_user_id") REFERENCES "active_users"("active_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_user_id_fkey" FOREIGN KEY ("active_user_id") REFERENCES "active_users"("active_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- テーブルコメント
COMMENT ON TABLE "users" IS 'ユーザーの基本情報テーブル（状態管理は別テーブル）';
COMMENT ON TABLE "active_users" IS 'アクティブユーザー情報';
COMMENT ON TABLE "banned_users" IS '禁止ユーザー情報';
COMMENT ON TABLE "leaved_users" IS '退会ユーザー情報';
COMMENT ON TABLE "sessions" IS 'セッション管理テーブル';
COMMENT ON TABLE "articles" IS '記事情報テーブル';
COMMENT ON TABLE "read_histories" IS '記事読取履歴テーブル';

-- usersテーブルのカラムコメント
COMMENT ON COLUMN "users"."user_id" IS 'ユーザーID（主キー）';
COMMENT ON COLUMN "users"."created_at" IS '作成日時';

-- active_usersテーブルのカラムコメント
COMMENT ON COLUMN "active_users"."active_user_id" IS 'アクティブユーザーID（主キー）';
COMMENT ON COLUMN "active_users"."email" IS 'メールアドレス（RFC5321準拠+余裕を持たせて1024文字）';
COMMENT ON COLUMN "active_users"."password" IS 'ハッシュ化されたパスワード';
COMMENT ON COLUMN "active_users"."display_name" IS '表示名（マルチバイト文字対応で1024文字）';
COMMENT ON COLUMN "active_users"."last_login" IS '最終ログイン日時';
COMMENT ON COLUMN "active_users"."created_at" IS '作成日時';
COMMENT ON COLUMN "active_users"."updated_at" IS '更新日時';
COMMENT ON COLUMN "active_users"."user_id" IS 'ベースユーザーテーブルへの外部キー';

-- banned_usersテーブルのカラムコメント
COMMENT ON COLUMN "banned_users"."user_id" IS 'ベースユーザーテーブルへの外部キー（主キー）';
COMMENT ON COLUMN "banned_users"."banned_at" IS 'BAN実行日時';
COMMENT ON COLUMN "banned_users"."reason" IS 'BAN理由（最大1024文字）';
COMMENT ON COLUMN "banned_users"."created_at" IS '作成日時';

-- leaved_usersテーブルのカラムコメント
COMMENT ON COLUMN "leaved_users"."user_id" IS 'ベースユーザーテーブルへの外部キー（主キー）';
COMMENT ON COLUMN "leaved_users"."reason" IS '退会理由（最大1024文字）';
COMMENT ON COLUMN "leaved_users"."created_at" IS '作成日時';

-- sessionsテーブルのカラムコメント
COMMENT ON COLUMN "sessions"."session_id" IS 'セッションID（UUID、主キー）';
COMMENT ON COLUMN "sessions"."session_token" IS 'セッショントークン';
COMMENT ON COLUMN "sessions"."expires_at" IS 'セッション有効期限';
COMMENT ON COLUMN "sessions"."ip_address" IS 'IPアドレス（IPv4/IPv6対応でVARCHAR(45)）';
COMMENT ON COLUMN "sessions"."user_agent" IS 'ユーザーエージェント情報';
COMMENT ON COLUMN "sessions"."created_at" IS '作成日時';
COMMENT ON COLUMN "sessions"."active_user_id" IS 'アクティブユーザーへの外部キー';

-- articlesテーブルのカラムコメント
COMMENT ON COLUMN "articles"."article_id" IS '記事ID（主キー）';
COMMENT ON COLUMN "articles"."media" IS 'メディア種別（qiita、zenn、noteなど）';
COMMENT ON COLUMN "articles"."title" IS '記事タイトル（最大100文字）';
COMMENT ON COLUMN "articles"."author" IS '投稿者名（最大30文字）';
COMMENT ON COLUMN "articles"."description" IS '記事概要（最大255文字）';
COMMENT ON COLUMN "articles"."url" IS '記事URL';
COMMENT ON COLUMN "articles"."created_at" IS '作成日時';

-- read_historiesテーブルのカラムコメント
COMMENT ON COLUMN "read_histories"."read_history_id" IS '読取履歴ID（主キー）';
COMMENT ON COLUMN "read_histories"."read_at" IS '読取日時';
COMMENT ON COLUMN "read_histories"."created_at" IS '作成日時';
COMMENT ON COLUMN "read_histories"."article_id" IS '記事ID（外部キー制約なし、記事削除後も履歴保持）';
COMMENT ON COLUMN "read_histories"."active_user_id" IS 'アクティブユーザーへの外部キー';
