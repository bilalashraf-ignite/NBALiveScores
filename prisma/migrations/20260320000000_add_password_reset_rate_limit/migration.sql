-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastPasswordResetEmailSent" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_lastPasswordResetEmailSent_idx" ON "User"("lastPasswordResetEmailSent");
