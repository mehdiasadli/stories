/*
  Warnings:

  - Made the column `name` on table `characters` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."characters" ALTER COLUMN "name" SET NOT NULL;
