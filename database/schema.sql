-- ============================================================================
-- SmartExpenseTracker — Relational Database Schema (MySQL 8.0+ / InnoDB)
-- Course: Database Management Systems (24CS520)
-- Institution: Sri Jayachamarajendra College of Engineering (SJCE), JSS STU Mysuru
-- ============================================================================

DROP DATABASE IF EXISTS expense_tracker;
CREATE DATABASE expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expense_tracker;

-- ============================================================================
-- 1. BASE TABLES (All Normalized to BCNF with >= 5 attributes per table)
-- ============================================================================

-- Table 1: users (10 attributes)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    full_name VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    phone_number VARCHAR(20),
    currency_preference VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_user_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN'))
) ENGINE=InnoDB;

-- Table 2: payment_accounts (10 attributes)
CREATE TABLE payment_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    account_name VARCHAR(150) NOT NULL,
    account_type ENUM('BANK_ACCOUNT', 'CREDIT_CARD', 'DIGITAL_WALLET', 'CASH', 'INVESTMENT') NOT NULL,
    institution_name VARCHAR(150),
    account_number_masked VARCHAR(50),
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    credit_limit DECIMAL(12,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    color VARCHAR(50) DEFAULT '#3b82f6',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_positive_credit_limit CHECK (credit_limit IS NULL OR credit_limit >= 0)
) ENGINE=InnoDB;

-- Table 3: category (8 attributes)
CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description VARCHAR(255),
    category_type ENUM('EXPENSE', 'INCOME') NOT NULL DEFAULT 'EXPENSE',
    color_code VARCHAR(50) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'fa-tag',
    parent_category_id BIGINT,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_category_id) REFERENCES category(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 4: expense (14 attributes)
CREATE TABLE expense (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    category_id BIGINT,
    account_id BIGINT,
    name VARCHAR(150) NOT NULL,
    merchant VARCHAR(150),
    description VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method ENUM('BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'DIGITAL_WALLET', 'UPI') NOT NULL DEFAULT 'UPI',
    payment_status ENUM('COMPLETED', 'PENDING', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    reference_number VARCHAR(100),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expense_account FOREIGN KEY (account_id) REFERENCES payment_accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_expense_positive_amount CHECK (amount > 0)
) ENGINE=InnoDB;

-- Table 5: budget (10 attributes)
CREATE TABLE budget (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    category_id BIGINT,
    monthly_limit DECIMAL(12,2) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    warning_threshold_percent DOUBLE NOT NULL DEFAULT 80.0,
    spent_amount DECIMAL(12,2) DEFAULT 0.00,
    notes VARCHAR(255),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_month_year_cat UNIQUE (user_id, month, year, category_id),
    CONSTRAINT chk_budget_limit CHECK (monthly_limit > 0),
    CONSTRAINT chk_threshold_range CHECK (warning_threshold_percent BETWEEN 10.0 AND 100.0)
) ENGINE=InnoDB;

-- Table 6: recurring_expenses (12 attributes)
CREATE TABLE recurring_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    category_id BIGINT,
    account_id BIGINT,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    auto_pay BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('ACTIVE', 'PAUSED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    reminder_days_before INT NOT NULL DEFAULT 3,
    notes VARCHAR(255),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_recurring_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_recurring_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    CONSTRAINT fk_recurring_account FOREIGN KEY (account_id) REFERENCES payment_accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_recurring_amount CHECK (amount > 0)
) ENGINE=InnoDB;

-- Table 7: savings_goals (11 attributes)
CREATE TABLE savings_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    account_id BIGINT,
    goal_name VARCHAR(150) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('IN_PROGRESS', 'ACHIEVED', 'PAUSED') NOT NULL DEFAULT 'IN_PROGRESS',
    color VARCHAR(50) DEFAULT '#10b981',
    notes VARCHAR(255),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_goals_account FOREIGN KEY (account_id) REFERENCES payment_accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_goal_target CHECK (target_amount > 0),
    CONSTRAINT chk_goal_current CHECK (current_amount >= 0)
) ENGINE=InnoDB;

-- Table 8: incomes (10 attributes)
CREATE TABLE incomes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    category_id BIGINT,
    account_id BIGINT,
    source VARCHAR(150) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    income_date DATE NOT NULL,
    payment_method ENUM('BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'DIGITAL_WALLET', 'UPI') NOT NULL DEFAULT 'BANK_TRANSFER',
    notes VARCHAR(255),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_income_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_income_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_account FOREIGN KEY (account_id) REFERENCES payment_accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_income_amount CHECK (amount > 0)
) ENGINE=InnoDB;

-- Table 9: tags & Many-to-Many Table 10: expense_tags
CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(50) DEFAULT '#38bdf8',
    description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE expense_tags (
    expense_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (expense_id, tag_id),
    CONSTRAINT fk_exp_tag_expense FOREIGN KEY (expense_id) REFERENCES expense(id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_tag_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- B-Tree Performance Indexes
CREATE INDEX idx_expense_date ON expense(expense_date);
CREATE INDEX idx_expense_category ON expense(category_id);
CREATE INDEX idx_expense_account ON expense(account_id);
CREATE INDEX idx_budget_lookup ON budget(month, year);
CREATE INDEX idx_recurring_due ON recurring_expenses(next_due_date, status);

-- ============================================================================
-- 2. DATABASE VIEWS (Phase 2 Requirement: Minimum 2 Views)
-- ============================================================================

-- View 1: view_monthly_expense_summary
-- Summarizes monthly spend, transaction volume, and average spend by category
CREATE OR REPLACE VIEW view_monthly_expense_summary AS
SELECT 
    MONTHNAME(e.expense_date) AS month_name,
    YEAR(e.expense_date) AS calendar_year,
    c.category_name,
    COUNT(e.id) AS total_transactions,
    COALESCE(SUM(e.amount), 0.00) AS total_spent,
    ROUND(AVG(e.amount), 2) AS average_ticket_size,
    MIN(e.amount) AS minimum_spend,
    MAX(e.amount) AS maximum_spend
FROM expense e
LEFT JOIN category c ON e.category_id = c.id
GROUP BY YEAR(e.expense_date), MONTHNAME(e.expense_date), c.category_name;

-- View 2: view_account_health_metrics
-- Aggregates current balance, credit limits, and total outflows per account
CREATE OR REPLACE VIEW view_account_health_metrics AS
SELECT 
    pa.id AS account_id,
    pa.account_name,
    pa.account_type,
    pa.institution_name,
    pa.current_balance,
    pa.credit_limit,
    COUNT(e.id) AS total_debit_events,
    COALESCE(SUM(e.amount), 0.00) AS total_disbursed,
    CASE 
        WHEN pa.account_type = 'CREDIT_CARD' AND pa.credit_limit > 0 
        THEN ROUND((pa.current_balance / pa.credit_limit) * 100, 2)
        ELSE NULL 
    END AS credit_utilization_pct
FROM payment_accounts pa
LEFT JOIN expense e ON pa.id = e.account_id
GROUP BY pa.id, pa.account_name, pa.account_type, pa.institution_name, pa.current_balance, pa.credit_limit;

-- ============================================================================
-- 3. DATABASE TRIGGERS (Phase 2 Requirement: Minimum 2 Triggers)
-- ============================================================================

DELIMITER $$

-- Trigger 1: trg_after_expense_insert_update_balance
-- Automatically deducts transaction amount from linked account balance on INSERT
CREATE TRIGGER trg_after_expense_insert_update_balance
AFTER INSERT ON expense
FOR EACH ROW
BEGIN
    IF NEW.account_id IS NOT NULL AND NEW.amount > 0 THEN
        UPDATE payment_accounts
        SET current_balance = current_balance - NEW.amount
        WHERE id = NEW.account_id;
    END IF;
END$$

-- Trigger 2: trg_after_expense_delete_refund_balance
-- Automatically refunds the amount to the linked account balance upon DELETE
CREATE TRIGGER trg_after_expense_delete_refund_balance
AFTER DELETE ON expense
FOR EACH ROW
BEGIN
    IF OLD.account_id IS NOT NULL AND OLD.amount > 0 THEN
        UPDATE payment_accounts
        SET current_balance = current_balance + OLD.amount
        WHERE id = OLD.account_id;
    END IF;
END$$

-- ============================================================================
-- 4. STORED PROCEDURES (Phase 2 Requirement: Minimum 2 Stored Procedures)
-- ============================================================================

-- Stored Procedure 1: sp_transfer_funds
-- ACID-compliant inter-account fund transfer with row-level locking (Pessimistic Locking)
CREATE PROCEDURE sp_transfer_funds(
    IN p_source_account_id BIGINT,
    IN p_dest_account_id BIGINT,
    IN p_transfer_amount DECIMAL(12,2),
    OUT p_status_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_src_balance DECIMAL(12,2);
    
    -- Validate Transfer Amount
    IF p_transfer_amount <= 0 THEN
        SET p_status_message = 'ERROR: Transfer amount must be greater than zero.';
        LEAVE proc_label;
    END IF;
    
    IF p_source_account_id = p_dest_account_id THEN
        SET p_status_message = 'ERROR: Source and destination accounts cannot be identical.';
        LEAVE proc_label;
    END IF;
    
    START TRANSACTION;
    
    -- Row-Level Lock Source Account
    SELECT current_balance INTO v_src_balance
    FROM payment_accounts
    WHERE id = p_source_account_id FOR UPDATE;
    
    -- Check Sufficient Funds
    IF v_src_balance < p_transfer_amount THEN
        ROLLBACK;
        SET p_status_message = CONCAT('FAILED: Insufficient funds. Available balance: ', v_src_balance);
        LEAVE proc_label;
    END IF;
    
    -- Debit Source Account
    UPDATE payment_accounts
    SET current_balance = current_balance - p_transfer_amount
    WHERE id = p_source_account_id;
    
    -- Credit Destination Account
    UPDATE payment_accounts
    SET current_balance = current_balance + p_transfer_amount
    WHERE id = p_dest_account_id;
    
    COMMIT;
    SET p_status_message = CONCAT('SUCCESS: Transferred ₹', p_transfer_amount, ' successfully.');
END$$

-- Stored Procedure 2: sp_reconcile_monthly_budget
-- Reconciles monthly budget limit vs actual expenditure, computing status and remaining headroom
CREATE PROCEDURE sp_reconcile_monthly_budget(
    IN p_month VARCHAR(20),
    IN p_year INT,
    OUT p_budget_limit DECIMAL(12,2),
    OUT p_total_spent DECIMAL(12,2),
    OUT p_remaining_balance DECIMAL(12,2),
    OUT p_utilization_pct DOUBLE,
    OUT p_budget_status VARCHAR(50)
)
BEGIN
    -- Fetch Configured Budget Limit
    SELECT COALESCE(SUM(monthly_limit), 0.00) INTO p_budget_limit
    FROM budget
    WHERE month = p_month AND year = p_year;
    
    -- Fetch Actual Total Spent
    SELECT COALESCE(SUM(amount), 0.00) INTO p_total_spent
    FROM expense
    WHERE MONTHNAME(expense_date) = p_month AND YEAR(expense_date) = p_year;
    
    -- Compute Remaining Balance
    SET p_remaining_balance = p_budget_limit - p_total_spent;
    
    -- Compute Utilization %
    IF p_budget_limit > 0 THEN
        SET p_utilization_pct = ROUND((p_total_spent * 100.0) / p_budget_limit, 2);
    ELSE
        SET p_utilization_pct = 0.00;
    END IF;
    
    -- Determine Operational Status
    IF p_budget_limit = 0 THEN
        SET p_budget_status = 'NO_BUDGET_SET';
    ELSEIF p_utilization_pct >= 100.0 THEN
        SET p_budget_status = 'BUDGET_EXCEEDED';
    ELSEIF p_utilization_pct >= 80.0 THEN
        SET p_budget_status = 'WARNING_THRESHOLD_REACHED';
    ELSE
        SET p_budget_status = 'SAFE_WITHIN_LIMIT';
    END IF;
END$$

DELIMITER ;
