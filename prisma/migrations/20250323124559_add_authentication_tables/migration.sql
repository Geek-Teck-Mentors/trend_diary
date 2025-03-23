-- CreateTable
CREATE TABLE "accounts" (
    "account_id" VARCHAR(1024) NOT NULL,
    "email" VARCHAR(1024) NOT NULL,
    "password" VARCHAR(1024) NOT NULL,
    "last_login" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(1024) NOT NULL,
    "account_id" VARCHAR(1024) NOT NULL,
    "display_name" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
