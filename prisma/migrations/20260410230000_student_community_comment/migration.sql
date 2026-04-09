-- CreateTable
CREATE TABLE "StudentCommunityComment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentCommunityComment_postId_createdAt_idx" ON "StudentCommunityComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentCommunityComment_userId_idx" ON "StudentCommunityComment"("userId");

-- AddForeignKey
ALTER TABLE "StudentCommunityComment" ADD CONSTRAINT "StudentCommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "StudentCommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCommunityComment" ADD CONSTRAINT "StudentCommunityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
