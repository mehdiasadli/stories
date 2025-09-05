/*
  Warnings:

  - You are about to drop the column `bio` on the `characters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."characters" DROP COLUMN "bio",
ADD COLUMN     "wiki" TEXT;
