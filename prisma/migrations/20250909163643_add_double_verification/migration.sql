/*
  Warnings:

  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "isVerified",
ADD COLUMN     "hasAdminVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
