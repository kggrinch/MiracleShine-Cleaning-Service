-- Drop tables (uncomment if needed)
-- DROP TABLE authentication;
-- DROP TABLE customer;


-- 1. Create Customer Table
-- Purpose: Holds Customer Data.
CREATE TABLE IF NOT EXISTS customer
(
    user_id INTEGER GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL DEFAULT 'N/A',
    passport_number VARCHAR(20) UNIQUE,
    PRIMARY KEY (user_id),
    CONSTRAINT chk_validation_email CHECK (email LIKE '%@%.%'),
    CONSTRAINT chk_name_length CHECK (LENGTH(first_name) >= 2 AND LENGTH(last_name) >= 2)
);


-- 2. Create Authentication Table
-- Purpose: Holds Customer login information.
CREATE TABLE IF NOT EXISTS authentication
(
    authentication_id INTEGER GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (authentication_id),
    CONSTRAINT fk_authentication
        FOREIGN KEY (user_id) REFERENCES customer(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- 3. Sample Data for Customer
-- Purpose: Store customer information.
INSERT INTO customer 
(first_name, last_name, email, phone, passport_number) 
VALUES
('Alice', 'Smith', 'alice.smith@example.com', '111-222-3333', 'PS123456'),
('Bob', 'Johnson', 'bob.j@example.com', '444-555-6666', 'PS789012'),
('Charlie', 'Brown', 'cbrownie@example.com','777-888-9999', 'PS345678'),
('Diana', 'Prince', 'diana.p@example.com', '222-333-4444', 'PS901234'),
('Eve', 'Adams', 'eve.a@example.com', '555-666-7777', 'PS567890'),
('Frank', 'White', 'frank.w@example.com', '888-999-0000', 'PS654321'),
('Grace', 'Taylor', 'grace.t@example.com', '123-456-7890', 'PS098765'),
('Henry', 'Miller','henry.m@example.com', '321-654-9870', 'PS246813'),
('Ivy', 'Davis', 'ivy.d@example.com', '987-654-3210', 'PS135792'),
('Jack', 'Garcia', 'jack.g@example.com', '987-654-3212', 'PS864209'),
('Jerry', 'Jones', 'JerrJ.g@example.com', '967-694-3112', 'PS864569'),
('Liam', 'Walker', 'liam.w@example.com', '222-444-6666', 'PS777888'),
('Mia', 'Harris', 'mia.h@example.com', '333-555-7777', 'PS888999'),
('Noah', 'Clark', 'noah.c@example.com', '444-666-8888', 'PS999000'),
('Olivia', 'Lewis', 'olivia.l@example.com', '555-777-9999', 'PS111222'),
('Sophia', 'Hall', 'sophia.h@example.com', '666-888-0000', 'PS333444');


-- 4. Sample Data for Authentication
-- Purpose: Store customer login credentials.
INSERT INTO authentication 
(user_id, username, password) 
VALUES
((SELECT user_id FROM customer WHERE email='alice.smith@example.com'), 'asmith', 'pass123'),
((SELECT user_id FROM customer WHERE email='bob.j@example.com'), 'bjohnson', 'securepwd'),
((SELECT user_id FROM customer WHERE email='cbrownie@example.com'), 'cbrown', 'mysecret'),
((SELECT user_id FROM customer WHERE email='diana.p@example.com'), 'dprince', 'wonderw'),
((SELECT user_id FROM customer WHERE email='eve.a@example.com'), 'eadams', 'evypass'),
((SELECT user_id FROM customer WHERE email='frank.w@example.com'), 'fwhite', 'frankpwd'),
((SELECT user_id FROM customer WHERE email='grace.t@example.com'), 'gtaylor', 'gracet'),
((SELECT user_id FROM customer WHERE email='henry.m@example.com'), 'hmiller', 'henry_m'),
((SELECT user_id FROM customer WHERE email='ivy.d@example.com'), 'idavis', 'ivy_d'),
((SELECT user_id FROM customer WHERE email='jack.g@example.com'), 'jgarcia', 'jackg'),
((SELECT user_id FROM customer WHERE email='JerrJ.g@example.com'), 'jjones', 'jj123'),
((SELECT user_id FROM customer WHERE email='liam.w@example.com'), 'lwalker', 'liampass'),
((SELECT user_id FROM customer WHERE email='mia.h@example.com'), 'mharris', 'miapass'),
((SELECT user_id FROM customer WHERE email='noah.c@example.com'), 'nclark', 'noahpass'),
((SELECT user_id FROM customer WHERE email='olivia.l@example.com'), 'olewis', 'oliviapass'),
((SELECT user_id FROM customer WHERE email='sophia.h@example.com'), 'shall', 'sophiapass');