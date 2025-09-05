-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT', 'ARCHIVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."CharacterAppearanceType" AS ENUM ('POV', 'APPEARANCE', 'MENTION');

-- CreateEnum
CREATE TYPE "public"."ContentVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."CharacterGender" AS ENUM ('MALE', 'FEMALE', 'NOT_SPECIFIED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CharacterRelationType" AS ENUM ('PARENT', 'SIBLING', 'SPOUSE', 'CHILD', 'LOVER');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verification_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chapters" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."ContentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "content" TEXT NOT NULL DEFAULT '',
    "previousContent" TEXT NOT NULL DEFAULT '',
    "coverImageUrl" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorite_chapters" (
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_chapters_pkey" PRIMARY KEY ("chapterId","userId")
);

-- CreateTable
CREATE TABLE "public"."chapter_reads" (
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_reads_pkey" PRIMARY KEY ("chapterId","userId")
);

-- CreateTable
CREATE TABLE "public"."characters" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "nameDescription" TEXT,
    "description" TEXT,
    "titles" TEXT[],
    "aliases" TEXT[],
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "dateOfBirth" TEXT,
    "dateOfDeath" TEXT,
    "placeOfBirth" TEXT,
    "placeOfDeath" TEXT,
    "deathDescription" TEXT,
    "gender" "public"."CharacterGender" NOT NULL DEFAULT 'NOT_SPECIFIED',

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."character_relations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."CharacterRelationType" NOT NULL,
    "description" TEXT,
    "characterId" TEXT NOT NULL,
    "relatedCharacterId" TEXT NOT NULL,

    CONSTRAINT "character_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chapter_characters" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "appearanceType" "public"."CharacterAppearanceType" NOT NULL,
    "note" TEXT,
    "quotesAndThoughts" TEXT[],

    CONSTRAINT "chapter_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "public"."users"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "public"."email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_slug_key" ON "public"."chapters"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_order_key" ON "public"."chapters"("order");

-- CreateIndex
CREATE INDEX "chapters_slug_idx" ON "public"."chapters"("slug");

-- CreateIndex
CREATE INDEX "chapters_title_idx" ON "public"."chapters"("title");

-- CreateIndex
CREATE INDEX "chapters_order_idx" ON "public"."chapters"("order");

-- CreateIndex
CREATE INDEX "chapters_status_idx" ON "public"."chapters"("status");

-- CreateIndex
CREATE INDEX "chapters_visibility_idx" ON "public"."chapters"("visibility");

-- CreateIndex
CREATE INDEX "chapters_authorId_idx" ON "public"."chapters"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "characters_slug_key" ON "public"."characters"("slug");

-- CreateIndex
CREATE INDEX "characters_slug_idx" ON "public"."characters"("slug");

-- CreateIndex
CREATE INDEX "characters_name_idx" ON "public"."characters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_characters_characterId_chapterId_key" ON "public"."chapter_characters"("characterId", "chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "comments_slug_key" ON "public"."comments"("slug");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "public"."comments"("userId");

-- CreateIndex
CREATE INDEX "comments_chapterId_idx" ON "public"."comments"("chapterId");

-- AddForeignKey
ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapters" ADD CONSTRAINT "chapters_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_chapters" ADD CONSTRAINT "favorite_chapters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_chapters" ADD CONSTRAINT "favorite_chapters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_reads" ADD CONSTRAINT "chapter_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_relations" ADD CONSTRAINT "character_relations_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_relations" ADD CONSTRAINT "character_relations_relatedCharacterId_fkey" FOREIGN KEY ("relatedCharacterId") REFERENCES "public"."characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chapter_characters" ADD CONSTRAINT "chapter_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
