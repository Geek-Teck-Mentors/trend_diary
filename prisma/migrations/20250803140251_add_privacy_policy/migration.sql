-- CreateTable
CREATE TABLE "public"."privacy_policies" (
    "version" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "effective_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "privacy_policies_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "public"."privacy_policy_consents" (
    "user_id" BIGINT NOT NULL,
    "policy_version" INTEGER NOT NULL,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "privacy_policy_consents_user_id_policy_version_key" ON "public"."privacy_policy_consents"("user_id", "policy_version");

-- AddForeignKey
ALTER TABLE "public"."privacy_policy_consents" ADD CONSTRAINT "privacy_policy_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- テーブルコメント
COMMENT ON TABLE "privacy_policies" IS 'プライバシーポリシーのバージョン管理テーブル';
COMMENT ON TABLE "privacy_policy_consents" IS 'ユーザーのプライバシーポリシー同意履歴テーブル';

-- privacy_policiesテーブルのカラムコメント
COMMENT ON COLUMN "privacy_policies"."version" IS 'プライバシーポリシーのバージョン番号（主キー）';
COMMENT ON COLUMN "privacy_policies"."content" IS 'プライバシーポリシーの内容（全文）';
COMMENT ON COLUMN "privacy_policies"."effective_at" IS 'プライバシーポリシーの制定日・有効開始日';
COMMENT ON COLUMN "privacy_policies"."created_at" IS '作成日時';
COMMENT ON COLUMN "privacy_policies"."updated_at" IS '更新日時';

-- privacy_policy_consentsテーブルのカラムコメント
COMMENT ON COLUMN "privacy_policy_consents"."user_id" IS '同意したユーザーID（外部キー）';
COMMENT ON COLUMN "privacy_policy_consents"."policy_version" IS '同意したプライバシーポリシーのバージョン';
COMMENT ON COLUMN "privacy_policy_consents"."consented_at" IS 'プライバシーポリシーに同意した日時';
COMMENT ON COLUMN "privacy_policy_consents"."created_at" IS '作成日時';
