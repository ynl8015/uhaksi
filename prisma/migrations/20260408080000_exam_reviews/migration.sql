-- CreateTable
CREATE TABLE "ExamReview" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "examTitle" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "grammarCount" INTEGER,
    "vocabCount" INTEGER,
    "readingCount" INTEGER,
    "writingCount" INTEGER,
    "listeningCount" INTEGER,
    "otherCount" INTEGER,
    "freeText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamReviewAggregate" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "examTitle" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "sourceCount" INTEGER NOT NULL,
    "statsJson" JSONB NOT NULL,
    "aiSummary" TEXT,
    "aiModel" TEXT,
    "aiGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamReviewAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamReview_schoolId_examTitle_grade_idx" ON "ExamReview"("schoolId", "examTitle", "grade");

-- CreateIndex
CREATE INDEX "ExamReview_createdByUserId_idx" ON "ExamReview"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamReview_schoolId_examTitle_grade_createdByUserId_key" ON "ExamReview"("schoolId", "examTitle", "grade", "createdByUserId");

-- CreateIndex
CREATE INDEX "ExamReviewAggregate_schoolId_examTitle_grade_idx" ON "ExamReviewAggregate"("schoolId", "examTitle", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "ExamReviewAggregate_schoolId_examTitle_grade_key" ON "ExamReviewAggregate"("schoolId", "examTitle", "grade");

-- AddForeignKey
ALTER TABLE "ExamReview" ADD CONSTRAINT "ExamReview_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamReview" ADD CONSTRAINT "ExamReview_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamReviewAggregate" ADD CONSTRAINT "ExamReviewAggregate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

