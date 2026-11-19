-- Move review ownership from appointments to their associated quote requests,
-- preserving existing review records and moderation information.
ALTER TABLE "reviews"
ADD COLUMN "quote_request_id" UUID;

UPDATE "reviews" AS r
SET "quote_request_id" = a."quote_request_id"
FROM "appointments" AS a
WHERE r."appointment_id" = a."id";

-- Existing reviews must always belong to a quote request.
ALTER TABLE "reviews"
ALTER COLUMN "quote_request_id" SET NOT NULL;

ALTER TABLE "reviews"
DROP CONSTRAINT "reviews_appointment_id_fkey";

DROP INDEX "reviews_appointment_id_key";

ALTER TABLE "reviews"
DROP COLUMN "appointment_id";

ALTER TABLE "appointments" DROP CONSTRAINT "appointments_quote_request_id_fkey";
DROP INDEX "appointments_quote_request_id_key";
DROP INDEX "idx_appointments_date_status";
DROP INDEX "idx_appointments_status_date";

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_quote_request_id_fkey"
FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "reviews_quote_request_id_key"
ON "reviews"("quote_request_id");

DROP TABLE "appointments";

DROP TYPE "appointment_status";

ALTER TABLE "quote_requests"
DROP COLUMN "preferred_date",
DROP COLUMN "preferred_time";
