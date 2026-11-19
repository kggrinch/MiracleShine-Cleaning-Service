-- Replace the detailed quote lifecycle with the three application statuses.
CREATE TYPE "quote_status_new" AS ENUM ('PENDING', 'SENT', 'REJECTED');

ALTER TABLE "quote_requests"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "quote_requests"
ALTER COLUMN "status" TYPE "quote_status_new"
USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'PENDING'
    WHEN 'CONTACTED' THEN 'PENDING'
    WHEN 'QUOTED' THEN 'SENT'
    WHEN 'ACCEPTED' THEN 'SENT'
    WHEN 'COMPLETED' THEN 'SENT'
    WHEN 'DECLINED' THEN 'REJECTED'
    ELSE 'PENDING'
  END
)::"quote_status_new";

ALTER TABLE "quote_requests"
ALTER COLUMN "status" SET DEFAULT 'PENDING'::"quote_status_new";

DROP TYPE "quote_status";

ALTER TYPE "quote_status_new" RENAME TO "quote_status";
