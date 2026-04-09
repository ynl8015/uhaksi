-- AlterTable
ALTER TABLE "SubjectRange" ADD COLUMN "grade" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "SubjectRange_examId_grade_subject_key" ON "SubjectRange"("examId", "grade", "subject");

