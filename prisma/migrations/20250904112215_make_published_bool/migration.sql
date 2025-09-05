/*
  Warnings:

  - You are about to drop the column `publishedAt` on the `characters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."characters" DROP COLUMN "publishedAt",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
