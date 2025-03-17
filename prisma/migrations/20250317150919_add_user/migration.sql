-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);
