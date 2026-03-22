-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastVerificationEmailSent" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_lastVerificationEmailSent_idx" ON "User"("lastVerificationEmailSent");
