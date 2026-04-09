-- DropIndex
DROP INDEX "SubjectRange_examId_grade_subject_key";

-- AlterTable
ALTER TABLE "SubjectRange"
  DROP COLUMN "textbook",
  DROP COLUMN "pages",
  ADD COLUMN "label" TEXT,
  ADD COLUMN "content" TEXT,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SubjectRange_examId_grade_subject_idx" ON "SubjectRange"("examId", "grade", "subject");

