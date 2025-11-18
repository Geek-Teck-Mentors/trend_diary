/*
  Warnings:

  - You are about to drop the `admin_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."admin_users" DROP CONSTRAINT "admin_users_active_user_id_fkey";

-- DropTable
DROP TABLE "public"."admin_users";
