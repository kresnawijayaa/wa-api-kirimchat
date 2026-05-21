CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED', 'BLOCKED');

CREATE TABLE "VerificationRequest" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "normalizedPhone" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "tokenPreview" TEXT NOT NULL,
  "messageText" TEXT NOT NULL,
  "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "waSender" TEXT,
  "waMessageId" TEXT,
  "rawWebhook" JSONB,
  "expiredAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerificationRequest_normalizedPhone_idx" ON "VerificationRequest"("normalizedPhone");
CREATE INDEX "VerificationRequest_status_idx" ON "VerificationRequest"("status");
CREATE INDEX "VerificationRequest_expiredAt_idx" ON "VerificationRequest"("expiredAt");
CREATE INDEX "VerificationRequest_tokenHash_idx" ON "VerificationRequest"("tokenHash");
