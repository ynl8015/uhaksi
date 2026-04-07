/*
  Warnings:

  - You are about to drop the column `pages` on the `ExamSubject` table. All the data in the column will be lost.
  - You are about to drop the column `textbook` on the `ExamSubject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExamSubject" DROP COLUMN "pages",
DROP COLUMN "textbook";

-- CreateTable
CREATE TABLE "SubjectRange" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "textbook" TEXT,
    "pages" TEXT,

    CONSTRAINT "SubjectRange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubjectRange" ADD CONSTRAINT "SubjectRange_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
