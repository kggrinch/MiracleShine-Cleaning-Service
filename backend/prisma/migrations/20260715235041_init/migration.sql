-- CreateTable
CREATE TABLE "authentication" (
    "authentication_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "authentication_pkey" PRIMARY KEY ("authentication_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL DEFAULT 'N/A',
    "passport_number" VARCHAR(20),

    CONSTRAINT "customer_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authentication_user_id_key" ON "authentication"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "authentication_username_key" ON "authentication"("username");

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_passport_number_key" ON "customer"("passport_number");

-- AddForeignKey
ALTER TABLE "authentication" ADD CONSTRAINT "fk_authetication" FOREIGN KEY ("user_id") REFERENCES "customer"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
