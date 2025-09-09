-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_CHAPTER_PUBLISHED', 'NEW_CHAPTER_COMMENT', 'NEW_CHAPTER_READ', 'NEW_CHAPTER_FAVORITE', 'NEW_CHARACTER_PUBLISHED', 'NEW_CHARACTER_FAVORITE', 'NEW_CHARACTER_VIEW', 'NEW_COMMENT_REPLY');

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "link" TEXT,
    "linkText" TEXT,
    "acceptLink" TEXT,
    "acceptLinkText" TEXT,
    "rejectLink" TEXT,
    "rejectLinkText" TEXT,
    "type" "public"."NotificationType" NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
