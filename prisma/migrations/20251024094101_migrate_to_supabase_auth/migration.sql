-- usersテーブルにsupabase_idカラムを追加
ALTER TABLE "users" ADD COLUMN "supabase_id" UUID NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_supabase_id_key" UNIQUE ("supabase_id");

-- admin_usersテーブルのカラム名とリレーションを変更
ALTER TABLE "admin_users" RENAME COLUMN "active_user_id" TO "user_id";

-- admin_usersの外部キー制約を削除して再作成
ALTER TABLE "admin_users" DROP CONSTRAINT "admin_users_active_user_id_fkey";
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- read_historiesテーブルのカラム名とリレーションを変更
ALTER TABLE "read_histories" RENAME COLUMN "active_user_id" TO "user_id";

-- read_historiesの外部キー制約を削除して再作成
ALTER TABLE "read_histories" DROP CONSTRAINT "read_histories_active_user_id_fkey";
ALTER TABLE "read_histories" ADD CONSTRAINT "read_histories_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- active_usersテーブル削除
DROP TABLE "active_users";

-- sessionsテーブル削除
DROP TABLE "sessions";
