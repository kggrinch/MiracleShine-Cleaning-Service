-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "service_category" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'SPECIALTY');

-- CreateEnum
CREATE TYPE "property_type" AS ENUM ('HOUSE', 'APARTMENT', 'OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "quote_status" AS ENUM ('PENDING', 'CONTACTED', 'QUOTED', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "contact_message_status" AS ENUM ('NEW', 'READ', 'RESPONDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "review_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "role" "user_role" NOT NULL DEFAULT 'CUSTOMER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "service_category" NOT NULL,
    "starting_price" DECIMAL(10,2),
    "estimated_duration_minutes" INTEGER NOT NULL,
    "image_url" VARCHAR(2048),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "service_id" UUID NOT NULL,
    "customer_first_name" VARCHAR(100) NOT NULL,
    "customer_last_name" VARCHAR(100) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(30),
    "property_type" "property_type" NOT NULL,
    "square_footage" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL(4,1),
    "street_address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "preferred_date" DATE,
    "preferred_time" TIME(6),
    "notes" TEXT,
    "status" "quote_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quote_request_id" UUID NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "customer_name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "contact_message_status" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointment_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "review_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role_active" ON "users"("role", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE INDEX "idx_services_category_active" ON "services"("category", "is_active");

-- CreateIndex
CREATE INDEX "idx_quotes_status_created" ON "quote_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_quotes_user_created" ON "quote_requests"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_quotes_service_created" ON "quote_requests"("service_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_quotes_customer_email" ON "quote_requests"("customer_email");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_quote_request_id_key" ON "appointments"("quote_request_id");

-- CreateIndex
CREATE INDEX "idx_appointments_date_status" ON "appointments"("scheduled_date", "status");

-- CreateIndex
CREATE INDEX "idx_appointments_status_date" ON "appointments"("status", "scheduled_date");

-- CreateIndex
CREATE INDEX "idx_contact_messages_status_created" ON "contact_messages"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_contact_messages_user_created" ON "contact_messages"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_appointment_id_key" ON "reviews"("appointment_id");

-- CreateIndex
CREATE INDEX "idx_reviews_status_created" ON "reviews"("status", "created_at");

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ============================================================
-- CHECK CONSTRAINTS
-- Enforce valid data at the database level.
-- ============================================================

ALTER TABLE "services"
    ADD CONSTRAINT "services_starting_price_nonnegative_check"
    CHECK ("starting_price" IS NULL OR "starting_price" >= 0);

ALTER TABLE "services"
    ADD CONSTRAINT "services_duration_positive_check"
    CHECK ("estimated_duration_minutes" > 0);

ALTER TABLE "quote_requests"
    ADD CONSTRAINT "quote_requests_square_footage_nonnegative_check"
    CHECK ("square_footage" IS NULL OR "square_footage" >= 0);

ALTER TABLE "quote_requests"
    ADD CONSTRAINT "quote_requests_bedrooms_nonnegative_check"
    CHECK ("bedrooms" IS NULL OR "bedrooms" >= 0);

ALTER TABLE "quote_requests"
    ADD CONSTRAINT "quote_requests_bathrooms_range_check"
    CHECK ("bathrooms" IS NULL OR ("bathrooms" >= 0 AND "bathrooms" <= 50));

ALTER TABLE "appointments"
    ADD CONSTRAINT "appointments_end_after_start_check"
    CHECK ("end_time" > "start_time");

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_rating_range_check"
    CHECK ("rating" >= 1 AND "rating" <= 5);


-- ============================================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at when a row changes,
-- including direct SQL updates outside Prisma.
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "users_set_updated_at"
    BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "services_set_updated_at"
    BEFORE UPDATE ON "services"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "quote_requests_set_updated_at"
    BEFORE UPDATE ON "quote_requests"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "appointments_set_updated_at"
    BEFORE UPDATE ON "appointments"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "contact_messages_set_updated_at"
    BEFORE UPDATE ON "contact_messages"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "reviews_set_updated_at"
    BEFORE UPDATE ON "reviews"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
