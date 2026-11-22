-- Preserve review content and restore author information before detaching reviews
-- from the quote request workflow.
ALTER TABLE "reviews"
ADD COLUMN "user_id" UUID,
ADD COLUMN "customer_name" VARCHAR(200);

UPDATE "reviews" AS r
SET
  "user_id" = q."user_id",
  "customer_name" = TRIM(q."customer_first_name" || ' ' || q."customer_last_name")
FROM "quote_requests" AS q
WHERE r."quote_request_id" = q."id";

ALTER TABLE "reviews"
DROP CONSTRAINT "reviews_quote_request_id_fkey";

DROP INDEX "reviews_quote_request_id_key";

ALTER TABLE "reviews"
DROP COLUMN "quote_request_id";

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_reviews_user_created"
ON "reviews"("user_id", "created_at");
