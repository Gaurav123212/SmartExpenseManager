-- ============================================================================
-- SmartExpenseTracker — Authentic Seed Data (MySQL 8.0+)
-- Reflects real student life UPI payments & college living transactions
-- Course: Database Management Systems (24CS520) - SJCE Mysuru
-- ============================================================================

USE expense_tracker;

-- Disable Foreign Key checks temporarily for clean bulk insertion
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE expense_tags;
TRUNCATE TABLE tags;
TRUNCATE TABLE incomes;
TRUNCATE TABLE savings_goals;
TRUNCATE TABLE recurring_expenses;
TRUNCATE TABLE expense;
TRUNCATE TABLE budget;
TRUNCATE TABLE category;
TRUNCATE TABLE payment_accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS (Auto-admin + Student accounts)
-- Passwords hashed with BCrypt for 'admin123'
INSERT INTO users (id, username, password, role, full_name, email, phone_number, currency_preference) VALUES
(1, 'admin', '$2a$10$tp.nK9iGwAsOFXzw71uBGO.FHD7zpHfhdA354Fhk0G9CANBJ9n8RW', 'ROLE_ADMIN', 'System Administrator', 'admin@smartexpense.sjce', '9880012345', 'INR'),
(2, 'gaurav', '$2a$10$tp.nK9iGwAsOFXzw71uBGO.FHD7zpHfhdA354Fhk0G9CANBJ9n8RW', 'ROLE_USER', 'Gaurav Sehrawat', '01jst21cs002@jssstuniv.in', '9845011223', 'INR');

-- 2. PAYMENT ACCOUNTS (Matching actual UPI bank handles from screenshots)
INSERT INTO payment_accounts (id, user_id, account_name, account_type, institution_name, account_number_masked, current_balance, credit_limit, currency, active, color) VALUES
(1, 2, 'SBI Campus Branch (UPI)', 'BANK_ACCOUNT', 'State Bank of India', 'XXXXXX7297', 18450.00, NULL, 'INR', TRUE, '#3b82f6'),
(2, 2, 'HDFC Millennia Credit Card', 'CREDIT_CARD', 'HDFC Bank', 'XXXXXX4812', 4200.00, 50000.00, 'INR', TRUE, '#f59e0b'),
(3, 2, 'Paytm Wallet & UPI', 'DIGITAL_WALLET', 'One97 Communications', 'XXXXXX7297', 1250.00, NULL, 'INR', TRUE, '#06b6d4'),
(4, 2, 'Hostel Emergency Cash', 'CASH', 'Physical Vault', 'CASH', 950.00, NULL, 'INR', TRUE, '#10b981');

-- 3. CATEGORIES (Normalized spending buckets with icons & hex colors)
INSERT INTO category (id, category_name, category_description, category_type, color_code, icon, parent_category_id) VALUES
(1, 'Food & Cafeteria', 'Campus canteen, mess, snacks, and dining out', 'EXPENSE', '#f59e0b', 'fa-utensils', NULL),
(2, 'Hostel & Rent', 'Room rent, maintenance, laundry, and hostel dues', 'EXPENSE', '#6366f1', 'fa-house', NULL),
(3, 'Academic & Books', 'Textbooks, lab manuals, stationery, and printing', 'EXPENSE', '#10b981', 'fa-book', NULL),
(4, 'Transit & Fuel', 'City buses, auto-rickshaws, bike fuel, and train tickets', 'EXPENSE', '#ec4899', 'fa-motorcycle', NULL),
(5, 'Subscriptions & Cloud', 'OTT, software licenses, AWS servers, and telecom recharge', 'EXPENSE', '#06b6d4', 'fa-laptop-code', NULL),
(6, 'Health & Fitness', 'Gym membership, medical supplies, and pharmacy', 'EXPENSE', '#f43f5e', 'fa-heart-pulse', NULL),
(7, 'Primary Allowance', 'Monthly family allowance and internship stipends', 'INCOME', '#22c55e', 'fa-money-bill-wave', NULL);

-- 4. MONTHLY BUDGETS
INSERT INTO budget (id, user_id, category_id, monthly_limit, month, year, warning_threshold_percent, spent_amount, notes) VALUES
(1, 2, NULL, 15000.00, 'November', 2026, 80.00, 12400.00, 'Overall monthly student allowance limit for November 2026'),
(2, 2, 1, 5000.00, 'November', 2026, 80.00, 4650.00, 'Dedicated food & mess spending cap');

-- 5. EXPENSES (Real-world transaction logs from the report field observations)
INSERT INTO expense (id, user_id, category_id, account_id, name, merchant, description, amount, expense_date, payment_method, payment_status, is_recurring, reference_number) VALUES
(1, 2, 1, 1, 'Paid to Sarthak Sjce', 'Sarthak Sjce', 'Campus canteen evening breakfast', 80.00, '2026-11-17', 'UPI', 'COMPLETED', FALSE, 'T2611172217400638182109'),
(2, 2, 1, 1, 'Paid to C V Vishwanath', 'C V Vishwanath', 'Evening fruit juice & snacks', 20.00, '2026-11-17', 'UPI', 'COMPLETED', FALSE, 'T2611171821520836396187'),
(3, 2, 1, 1, 'Paid to Arnav Bhai', 'Arnav Bhai', 'Stationery store photocopy & prints', 65.00, '2026-11-17', 'UPI', 'COMPLETED', FALSE, 'T2611171031090169697786'),
(4, 2, 1, 1, 'Paid to C V Vishwanath', 'C V Vishwanath', 'Coffee & light refreshment', 20.00, '2026-11-16', 'UPI', 'COMPLETED', FALSE, 'T2611162130002972995774'),
(5, 2, 1, 1, 'Paid to Bangla', 'Bangla Restaurant', 'Dinner with roommates', 140.00, '2026-11-16', 'UPI', 'COMPLETED', FALSE, 'T2611162020395877773308'),
(6, 2, 1, 1, 'Paid to C V Vishwanath', 'C V Vishwanath', 'Tea & snacks', 20.00, '2026-11-09', 'UPI', 'COMPLETED', FALSE, 'T2611092115583590639724'),
(7, 2, 1, 1, 'Paid to Bangla', 'Bangla Restaurant', 'Lunch thali', 150.00, '2026-11-09', 'UPI', 'COMPLETED', FALSE, 'T2611091534527154374597'),
(8, 2, 1, 1, 'Paid to Shrid Shukla', 'Shrid Shukla', 'Mess reimbursement share', 150.00, '2026-11-08', 'UPI', 'COMPLETED', FALSE, 'T2611082222288170050348'),
(9, 2, 1, 1, 'Paid to BANARAS FAMOUS CHAATS', 'Banaras Chaats', 'Weekend street food with friends', 110.00, '2026-11-08', 'UPI', 'COMPLETED', FALSE, 'T2611081929560668639127'),
(10, 2, 1, 1, 'Paid to Ashokkumar K P', 'Ashokkumar K P', 'Bakery snacks', 30.00, '2026-11-08', 'UPI', 'COMPLETED', FALSE, 'T2611081916523821566839'),
(11, 2, 3, 2, 'Paid to Vijay Enterprises', 'Vijay Enterprises', 'Engineering textbook & drawing kit', 1200.00, '2026-11-08', 'CREDIT_CARD', 'COMPLETED', FALSE, 'T2611081855079183341064'),
(12, 2, 3, 1, 'Paid to Arnav Bhai', 'Arnav Bhai', 'Lab record submission binding', 345.00, '2026-11-07', 'UPI', 'COMPLETED', FALSE, 'T2611072315059888770669'),
(13, 2, 1, 1, 'Paid to C V Vishwanath', 'C V Vishwanath', 'Tea stall', 10.00, '2026-11-07', 'UPI', 'COMPLETED', FALSE, 'T2611072111116612937170'),
(14, 2, 2, 1, 'Hostel Room Rent', 'SJCE Hostel Office', 'Monthly hostel room occupancy charge', 4200.00, '2026-11-01', 'BANK_TRANSFER', 'COMPLETED', TRUE, 'RENT-NOV-2026'),
(15, 2, 4, 1, 'Petrol Bunk Mysuru', 'Indian Oil Outlet', 'Scooter full tank petrol', 850.00, '2026-11-05', 'UPI', 'COMPLETED', FALSE, 'IOCL-77491'),
(16, 2, 5, 2, 'Netflix 4K Ultra Subscription', 'Netflix India', 'Monthly family streaming subscription', 649.00, '2026-11-02', 'CREDIT_CARD', 'COMPLETED', TRUE, 'NETFLIX-9921');

-- 6. INCOMES (Incoming credits matching screenshots)
INSERT INTO incomes (id, user_id, category_id, account_id, source, amount, income_date, payment_method, notes) VALUES
(1, 2, 7, 1, 'Received from Shrid Shukla', 350.00, '2026-11-17', 'UPI', 'Room split balance settlement (UTR: 858885867223)'),
(2, 2, 7, 1, 'Received from Shrid Shukla', 150.00, '2026-11-16', 'UPI', 'Project printout reimbursement (UTR: 107544865631)'),
(3, 2, 7, 1, 'Monthly Parent Allowance', 15000.00, '2026-11-01', 'BANK_TRANSFER', 'Primary living allowance for November');

-- 7. RECURRING EXPENSES (Subscriptions & Scheduled Bills)
INSERT INTO recurring_expenses (id, user_id, category_id, account_id, title, amount, frequency, start_date, next_due_date, auto_pay, status, reminder_days_before, notes) VALUES
(1, 2, 5, 2, 'Netflix 4K Ultra', 649.00, 'MONTHLY', '2026-05-01', '2026-12-02', TRUE, 'ACTIVE', 3, 'Shared student subscription'),
(2, 2, 2, 1, 'College Hostel Fee', 4200.00, 'MONTHLY', '2026-08-01', '2026-12-01', FALSE, 'ACTIVE', 5, 'Campus room fee'),
(3, 2, 5, 2, 'Spotify Student Premium', 119.00, 'MONTHLY', '2026-01-01', '2026-11-28', TRUE, 'ACTIVE', 2, 'Music streaming');

-- 8. SAVINGS GOALS
INSERT INTO savings_goals (id, user_id, account_id, goal_name, target_amount, current_amount, target_date, priority, status, color, notes) VALUES
(1, 2, 1, 'Laptop RAM & SSD Upgrade', 12000.00, 8500.00, '2026-12-25', 'HIGH', 'IN_PROGRESS', '#3b82f6', '32GB DDR5 + 1TB NVMe for ML coursework'),
(2, 2, 1, 'Semester Break Goa Trip', 10000.00, 6500.00, '2027-01-15', 'MEDIUM', 'IN_PROGRESS', '#ec4899', 'Post exam batch tour with peers'),
(3, 2, 1, 'Emergency Medical Contingency', 15000.00, 15000.00, '2026-11-01', 'URGENT', 'ACHIEVED', '#10b981', 'Pre-funded reserve deposited in SBI');

-- 9. TAGS & ASSOCIATIONS
INSERT INTO tags (id, name, color, description) VALUES
(1, 'UPI', '#06b6d4', 'Fast UPI micro-transaction'),
(2, 'HostelLife', '#6366f1', 'Hostel living and roommate expenses'),
(3, 'Academic', '#10b981', 'College laboratory and curriculum expenditure'),
(4, 'Reimbursement', '#f59e0b', 'Peer-settled shared expense');

INSERT INTO expense_tags (expense_id, tag_id) VALUES
(1, 1), (1, 2),
(2, 1),
(3, 1), (3, 3),
(5, 1), (5, 2),
(8, 1), (8, 4),
(11, 3),
(12, 1), (12, 3),
(14, 2);
