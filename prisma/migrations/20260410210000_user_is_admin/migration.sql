-- AlterTable (IF NOT EXISTS: 이미 컬럼이 있는 DB에서도 통과)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
