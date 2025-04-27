-- CreateTable
CREATE TABLE "ping" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ping_pkey" PRIMARY KEY ("id")
);
