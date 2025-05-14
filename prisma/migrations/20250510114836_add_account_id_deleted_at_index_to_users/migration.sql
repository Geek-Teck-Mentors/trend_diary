-- CreateIndex
CREATE INDEX "users_account_id_index" ON "users"("account_id", "deleted_at");
