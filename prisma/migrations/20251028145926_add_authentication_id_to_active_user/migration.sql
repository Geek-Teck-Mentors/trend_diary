-- AlterTable
ALTER TABLE "active_users" ADD COLUMN "authentication_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "active_users_authentication_id_key" ON "active_users"("authentication_id");
