-- CreateEnum
CREATE TYPE "AccountKind" AS ENUM ('STUDENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunityCategory" AS ENUM ('QA', 'STUDY_TIP', 'STUDY_PROOF');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accountKind" "AccountKind" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "User" ADD COLUMN "studentVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "verifiedSchoolName" TEXT;

-- CreateTable
CREATE TABLE "StudentCommunityPost" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" "CommunityCategory" NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "imageData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentCommunityPost_category_createdAt_idx" ON "StudentCommunityPost"("category", "createdAt");

-- CreateIndex
CREATE INDEX "StudentCommunityPost_userId_idx" ON "StudentCommunityPost"("userId");

-- AddForeignKey
ALTER TABLE "StudentCommunityPost" ADD CONSTRAINT "StudentCommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
