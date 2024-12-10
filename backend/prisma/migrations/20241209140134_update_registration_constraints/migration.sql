-- DropIndex
DROP INDEX "Registration_email_eventId_key";

-- CreateIndex
CREATE INDEX "Registration_email_eventId_idx" ON "Registration"("email", "eventId");
