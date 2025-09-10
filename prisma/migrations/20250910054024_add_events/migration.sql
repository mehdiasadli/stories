-- DropForeignKey
ALTER TABLE "public"."chapter_characters" DROP CONSTRAINT "chapter_characters_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_characters" DROP CONSTRAINT "chapter_characters_characterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_reads" DROP CONSTRAINT "chapter_reads_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chapter_reads" DROP CONSTRAINT "chapter_reads_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."character_relations" DROP CONSTRAINT "character_relations_characterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."character_relations" DROP CONSTRAINT "character_relations_relatedCharacterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."character_views" DROP CONSTRAINT "character_views_characterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorite_chapters" DROP CONSTRAINT "favorite_chapters_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorite_chapters" DROP CONSTRAINT "favorite_chapters_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorite_characters" DROP CONSTRAINT "favorite_characters_characterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorite_characters" DROP CONSTRAINT "favorite_characters_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."favorite_chapters" ADD CONSTRAINT "favorite_chapters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_chapters" ADD CONSTRAINT "favorite_chapters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_views" ADD CONSTRAINT "character_views_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_characters" ADD CONSTRAINT "favorite_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_characters" ADD CONSTRAINT "favorite_characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_relations" ADD CONSTRAINT "character_relations_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_relations" ADD CONSTRAINT "character_relations_relatedCharacterId_fkey" FOREIGN KEY ("relatedCharacterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
