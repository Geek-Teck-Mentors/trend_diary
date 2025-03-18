-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(1024) NOT NULL,
    "account_id" VARCHAR(1024) NOT NULL,
    "display_name" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);
