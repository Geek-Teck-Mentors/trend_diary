/*
  Warnings:

  - You are about to drop the `endpoint_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `endpoints` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `privacy_policies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `privacy_policy_consents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."endpoint_permissions" DROP CONSTRAINT "endpoint_permissions_endpoint_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."endpoint_permissions" DROP CONSTRAINT "endpoint_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."privacy_policy_consents" DROP CONSTRAINT "privacy_policy_consents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_roles" DROP CONSTRAINT "user_roles_active_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropTable
DROP TABLE "public"."endpoint_permissions";

-- DropTable
DROP TABLE "public"."endpoints";

-- DropTable
DROP TABLE "public"."permissions";

-- DropTable
DROP TABLE "public"."privacy_policies";

-- DropTable
DROP TABLE "public"."privacy_policy_consents";

-- DropTable
DROP TABLE "public"."role_permissions";

-- DropTable
DROP TABLE "public"."roles";

-- DropTable
DROP TABLE "public"."user_roles";
