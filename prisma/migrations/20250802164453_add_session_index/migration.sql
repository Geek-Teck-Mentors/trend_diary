-- CreateIndex
CREATE INDEX "sessions_session_id_expires_at_idx" ON "sessions"("session_id", "expires_at");

COMMENT ON INDEX "sessions_session_id_expires_at_idx" IS 'セッションの有効期限とIDに基づくインデックス, 有効なセッションの取得に使う';
