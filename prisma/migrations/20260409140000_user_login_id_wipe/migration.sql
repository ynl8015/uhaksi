-- 후기·집계·유저 데이터 초기화 후 로그인 아이디(loginId) 컬럼 추가
DELETE FROM "ExamReview";
DELETE FROM "ExamReviewAggregate";
DELETE FROM "User";

ALTER TABLE "User" ADD COLUMN "loginId" TEXT NOT NULL;

CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");
