-- Supabase Auth移行に伴う不要カラム・テーブルの削除

-- sessionsテーブルを削除（Supabase Authがセッション管理）
DROP TABLE IF EXISTS "sessions";

-- active_usersテーブルから不要カラムを削除
ALTER TABLE "active_users" DROP COLUMN IF EXISTS "password";
ALTER TABLE "active_users" DROP COLUMN IF EXISTS "last_login";
