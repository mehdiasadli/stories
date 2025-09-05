/*
  Warnings:

  - You are about to drop the column `visibility` on the `chapters` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."chapters_visibility_idx";

-- AlterTable
ALTER TABLE "public"."chapters" DROP COLUMN "visibility";

-- DropEnum
DROP TYPE "public"."ContentVisibility";
