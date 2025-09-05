-- AlterTable
ALTER TABLE "public"."character_views" ADD COLUMN     "fingerprint" TEXT;

-- CreateIndex
CREATE INDEX "character_views_characterId_fingerprint_createdAt_idx" ON "public"."character_views"("characterId", "fingerprint", "createdAt");
