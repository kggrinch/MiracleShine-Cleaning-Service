-- ============================================================
-- MiracleShine Cleaning Service
-- Complete Database Reset + Schema + Demo Data
--
-- WARNING: Every run deletes existing application data
-- and recreates the database tables from scratch.
--
-- Target: Development database
-- ============================================================

BEGIN;


-- ============================================================
-- 0. RESET EXISTING DATABASE OBJECTS
-- ============================================================

DROP TABLE IF EXISTS
    reviews,
    contact_messages,
    appointments,
    quote_requests,
    services,
    users
CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

DROP TYPE IF EXISTS review_status CASCADE;
DROP TYPE IF EXISTS contact_message_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS service_category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;


-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'CUSTOMER', 'ADMIN'
);

CREATE TYPE service_category AS ENUM (
    'RESIDENTIAL', 'COMMERCIAL', 'SPECIALTY'
);

CREATE TYPE property_type AS ENUM (
    'HOUSE', 'APARTMENT', 'OFFICE', 'OTHER'
);

CREATE TYPE quote_status AS ENUM (
    'PENDING', 'CONTACTED', 'QUOTED',
    'ACCEPTED', 'DECLINED', 'COMPLETED'
);

CREATE TYPE appointment_status AS ENUM (
    'REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
);

CREATE TYPE contact_message_status AS ENUM (
    'NEW', 'READ', 'RESPONDED', 'CLOSED'
);

CREATE TYPE review_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED'
);


-- ============================================================
-- 2. USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. SERVICES
-- ============================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category service_category NOT NULL,
    starting_price NUMERIC(10, 2),
    estimated_duration_minutes INTEGER NOT NULL,
    image_url VARCHAR(2048),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT services_starting_price_nonnegative
        CHECK (starting_price IS NULL OR starting_price >= 0),

    CONSTRAINT services_duration_positive
        CHECK (estimated_duration_minutes > 0)
);


-- ============================================================
-- 4. QUOTE REQUESTS
-- ============================================================

CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    service_id UUID NOT NULL,

    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30),

    property_type property_type NOT NULL,
    square_footage INTEGER,
    bedrooms INTEGER,
    bathrooms NUMERIC(4, 1),

    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,

    preferred_date DATE,
    preferred_time TIME,
    notes TEXT,

    status quote_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT quote_requests_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT quote_requests_service_fk
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT quotes_square_footage_nonnegative
        CHECK (square_footage IS NULL OR square_footage >= 0),

    CONSTRAINT quotes_bedrooms_nonnegative
        CHECK (bedrooms IS NULL OR bedrooms >= 0),

    CONSTRAINT quotes_bathrooms_valid
        CHECK (
            bathrooms IS NULL
            OR (bathrooms >= 0 AND bathrooms <= 50)
        )
);


-- ============================================================
-- 5. APPOINTMENTS
-- ============================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID NOT NULL UNIQUE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'REQUESTED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT appointments_quote_request_fk
        FOREIGN KEY (quote_request_id)
        REFERENCES quote_requests(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT appointments_end_after_start
        CHECK (end_time > start_time)
);


-- ============================================================
-- 6. CONTACT MESSAGES
-- ============================================================

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    customer_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status contact_message_status NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_messages_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- ============================================================
-- 7. REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE,
    rating INTEGER NOT NULL,
    comment TEXT,
    status review_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT reviews_appointment_fk
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT reviews_rating_valid
        CHECK (rating BETWEEN 1 AND 5)
);


-- ============================================================
-- 8. INDEXES
-- ============================================================

CREATE INDEX idx_users_role_active
    ON users(role, is_active);

CREATE INDEX idx_services_category_active
    ON services(category, is_active);

CREATE INDEX idx_quotes_status_created
    ON quote_requests(status, created_at);

CREATE INDEX idx_quotes_user_created
    ON quote_requests(user_id, created_at);

CREATE INDEX idx_quotes_service_created
    ON quote_requests(service_id, created_at);

CREATE INDEX idx_quotes_customer_email
    ON quote_requests(customer_email);

CREATE INDEX idx_appointments_date_status
    ON appointments(scheduled_date, status);

CREATE INDEX idx_appointments_status_date
    ON appointments(status, scheduled_date);

CREATE INDEX idx_contact_messages_status_created
    ON contact_messages(status, created_at);

CREATE INDEX idx_contact_messages_user_created
    ON contact_messages(user_id, created_at);

CREATE INDEX idx_reviews_status_created
    ON reviews(status, created_at);


-- ============================================================
-- 9. AUTOMATIC UPDATED_AT TRIGGERS
-- ============================================================

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER services_set_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER quote_requests_set_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER appointments_set_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contact_messages_set_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER reviews_set_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 10. DEMO USERS
-- Passwords are placeholders, not valid password hashes.
-- ============================================================

INSERT INTO users (
    first_name, last_name, email, password_hash, phone, role
)
VALUES
    ('John', 'Smith', 'john.smith@example.com',
     'DEMO_ONLY', '425-555-0101', 'CUSTOMER'),

    ('Emily', 'Johnson', 'emily.johnson@example.com',
     'DEMO_ONLY', '425-555-0102', 'CUSTOMER'),

    ('Michael', 'Brown', 'michael.brown@example.com',
     'DEMO_ONLY', '425-555-0103', 'CUSTOMER'),

    ('Admin', 'User', 'admin@example.com',
     'DEMO_ONLY', '425-555-0104', 'ADMIN');


-- ============================================================
-- 11. DEMO CLEANING SERVICES
-- Prices and durations are development examples only.
-- ============================================================

INSERT INTO services (
    name, description, category,
    starting_price, estimated_duration_minutes, image_url
)
VALUES
    (
        'Residential Cleaning',
        'Regular home cleaning to keep living spaces clean, comfortable, and welcoming.',
        'RESIDENTIAL', 120.00, 120, NULL
    ),
    (
        'Commercial Cleaning',
        'Professional cleaning services for commercial properties and business spaces.',
        'COMMERCIAL', 200.00, 180, NULL
    ),
    (
        'Deep Cleaning',
        'A detailed cleaning service focused on hard-to-reach areas and built-up dirt.',
        'RESIDENTIAL', 180.00, 240, NULL
    ),
    (
        'Move In / Move Out Cleaning',
        'Detailed cleaning to prepare a property for new occupants or after moving out.',
        'RESIDENTIAL', 220.00, 240, NULL
    ),
    (
        'Disinfecting & Sanitizing Services',
        'Cleaning and sanitizing high-touch surfaces and commonly used areas.',
        'SPECIALTY', 150.00, 120, NULL
    ),
    (
        'Post Construction Cleaning',
        'Cleaning after construction or renovation to remove dust and debris.',
        'SPECIALTY', 250.00, 300, NULL
    ),
    (
        'Carpet Cleaning',
        'Carpet cleaning to help remove dirt, stains, and accumulated debris.',
        'SPECIALTY', 100.00, 90, NULL
    ),
    (
        'Office Cleaning',
        'Cleaning workspaces, offices, shared areas, and other workplace facilities.',
        'COMMERCIAL', 150.00, 120, NULL
    ),
    (
        'Special Service Cleaning',
        'Customized cleaning services based on specific property or customer needs.',
        'SPECIALTY', NULL, 120, NULL
    );


-- ============================================================
-- 12. DEMO QUOTE REQUESTS
-- ============================================================

INSERT INTO quote_requests (
    user_id, service_id,
    customer_first_name, customer_last_name,
    customer_email, customer_phone,
    property_type, square_footage, bedrooms, bathrooms,
    street_address, city, state, postal_code,
    preferred_date, preferred_time, notes, status
)
VALUES
    (
        (SELECT id FROM users
         WHERE email = 'john.smith@example.com'),
        (SELECT id FROM services
         WHERE name = 'Residential Cleaning'),
        'John', 'Smith',
        'john.smith@example.com', '425-555-0101',
        'HOUSE', 1800, 3, 2.0,
        '123 Demo Street', 'Lynnwood', 'WA', '98036',
        CURRENT_DATE + 7, '10:00',
        'Interested in regular weekly cleaning.',
        'ACCEPTED'
    ),
    (
        (SELECT id FROM users
         WHERE email = 'emily.johnson@example.com'),
        (SELECT id FROM services
         WHERE name = 'Deep Cleaning'),
        'Emily', 'Johnson',
        'emily.johnson@example.com', '425-555-0102',
        'APARTMENT', 950, 2, 1.0,
        '456 Sample Avenue', 'Edmonds', 'WA', '98020',
        CURRENT_DATE + 10, '13:00',
        'Please focus on the kitchen and bathrooms.',
        'CONTACTED'
    ),
    (
        NULL,
        (SELECT id FROM services
         WHERE name = 'Office Cleaning'),
        'Sarah', 'Davis',
        'sarah.davis@example.com', '425-555-0105',
        'OFFICE', 2500, NULL, NULL,
        '789 Example Boulevard', 'Bothell', 'WA', '98011',
        CURRENT_DATE + 14, '09:00',
        'Looking for recurring office cleaning.',
        'QUOTED'
    );


-- ============================================================
-- 13. DEMO APPOINTMENTS
-- John: completed appointment with a review.
-- Emily: confirmed appointment.
-- ============================================================

INSERT INTO appointments (
    quote_request_id, scheduled_date,
    start_time, end_time, status, notes
)
VALUES
    (
        (SELECT id FROM quote_requests
         WHERE customer_email = 'john.smith@example.com'
           AND notes = 'Interested in regular weekly cleaning.'),
        CURRENT_DATE + 7, '10:00', '12:00',
        'COMPLETED',
        'Demo completed residential cleaning.'
    ),
    (
        (SELECT id FROM quote_requests
         WHERE customer_email = 'emily.johnson@example.com'
           AND notes = 'Please focus on the kitchen and bathrooms.'),
        CURRENT_DATE + 10, '13:00', '17:00',
        'CONFIRMED',
        'Demo scheduled deep cleaning.'
    );


-- ============================================================
-- 14. DEMO CONTACT MESSAGES
-- ============================================================

INSERT INTO contact_messages (
    user_id, customer_name, email, phone,
    subject, message, status
)
VALUES
    (
        (SELECT id FROM users
         WHERE email = 'john.smith@example.com'),
        'John Smith', 'john.smith@example.com',
        '425-555-0101',
        'Recurring Cleaning',
        'I would like more information about recurring cleaning plans.',
        'NEW'
    ),
    (
        NULL,
        'Sarah Davis', 'sarah.davis@example.com',
        '425-555-0105',
        'Commercial Services',
        'Do you provide cleaning services for larger office buildings?',
        'RESPONDED'
    );


-- ============================================================
-- 15. DEMO REVIEW
-- ============================================================

INSERT INTO reviews (
    appointment_id, rating, comment, status
)
VALUES (
    (
        SELECT a.id
        FROM appointments a
        JOIN quote_requests q
          ON q.id = a.quote_request_id
        WHERE q.customer_email = 'john.smith@example.com'
          AND a.status = 'COMPLETED'
    ),
    5,
    'The cleaning was thorough and the service was professional.',
    'APPROVED'
);


-- ============================================================
-- 16. FINISH DATABASE RESET AND SEED
-- ============================================================

COMMIT;


-- ============================================================
-- 17. VERIFY DATABASE TABLES
-- ============================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- ============================================================
-- 18. VERIFY RECORD COUNTS
-- Expected:
-- 4 users, 9 services, 3 quote requests, 2 appointments,
-- 2 contact messages, 1 review.
-- ============================================================

SELECT
    (SELECT COUNT(*) FROM users) AS users_count,
    (SELECT COUNT(*) FROM services) AS services_count,
    (SELECT COUNT(*) FROM quote_requests) AS quote_requests_count,
    (SELECT COUNT(*) FROM appointments) AS appointments_count,
    (SELECT COUNT(*) FROM contact_messages) AS contact_messages_count,
    (SELECT COUNT(*) FROM reviews) AS reviews_count;


-- ============================================================
-- 19. VIEW SERVICE CATALOG
-- ============================================================

SELECT
    name,
    category,
    starting_price,
    estimated_duration_minutes,
    is_active
FROM services
ORDER BY name;


-- ============================================================
-- 20. VIEW QUOTE REQUESTS
-- ============================================================

SELECT
    q.customer_first_name,
    q.customer_last_name,
    q.customer_email,
    s.name AS service_name,
    q.status,
    q.preferred_date
FROM quote_requests q
JOIN services s ON s.id = q.service_id
ORDER BY q.created_at;


-- ============================================================
-- 21. VIEW APPOINTMENTS AND REVIEWS
-- ============================================================

SELECT
    q.customer_first_name,
    q.customer_last_name,
    s.name AS service_name,
    a.scheduled_date,
    a.start_time,
    a.end_time,
    a.status AS appointment_status,
    r.rating,
    r.status AS review_status
FROM appointments a
JOIN quote_requests q ON q.id = a.quote_request_id
JOIN services s ON s.id = q.service_id
LEFT JOIN reviews r ON r.appointment_id = a.id
ORDER BY a.scheduled_date;