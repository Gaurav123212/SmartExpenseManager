-- ============================================================================
-- SmartExpenseTracker — Comprehensive Syllabus Query Suite (MySQL 8.0+)
-- Course: Database Management Systems (24CS520)
-- Institution: Sri Jayachamarajendra College of Engineering (SJCE), JSS STU Mysuru
-- ============================================================================

USE expense_tracker;

-- ============================================================================
-- 1. SIMPLE QUERIES (Phase 1 Requirement: Minimum 5 Simple Queries)
-- ============================================================================

-- SQ-01: Retrieve all active payment accounts with non-zero balances
SELECT account_name, account_type, institution_name, current_balance, currency
FROM payment_accounts
WHERE active = TRUE AND current_balance > 0
ORDER BY current_balance DESC;

-- SQ-02: List all transactions paid specifically via UPI payment channel
SELECT id, name, merchant, amount, expense_date, reference_number
FROM expense
WHERE payment_method = 'UPI'
ORDER BY expense_date DESC;

-- SQ-03: Retrieve all spending categories sorted alphabetically by name
SELECT id, category_name, category_type, color_code, icon
FROM category
WHERE category_type = 'EXPENSE'
ORDER BY category_name ASC;

-- SQ-04: Retrieve all active subscriptions due within the current month
SELECT title, amount, frequency, next_due_date, auto_pay
FROM recurring_expenses
WHERE status = 'ACTIVE' AND next_due_date <= '2026-11-30'
ORDER BY next_due_date ASC;

-- SQ-05: Retrieve achieved savings milestones
SELECT goal_name, target_amount, current_amount, target_date, priority, status
FROM savings_goals
WHERE status = 'ACHIEVED';

-- ============================================================================
-- 2. NESTED QUERIES / SUBQUERIES (Phase 1 Requirement: Minimum 5 Nested Queries)
-- ============================================================================

-- NQ-01: Find expenses that exceed the average expense amount of all transactions
SELECT id, name, merchant, amount, expense_date
FROM expense
WHERE amount > (SELECT AVG(amount) FROM expense)
ORDER BY amount DESC;

-- NQ-02: Find all categories that have at least one expense exceeding ₹500
SELECT category_name, category_description
FROM category
WHERE id IN (
    SELECT DISTINCT category_id
    FROM expense
    WHERE amount >= 500.00
);

-- NQ-03: Retrieve accounts that have funded more expenses than the average account transaction count
SELECT account_name, current_balance
FROM payment_accounts
WHERE id IN (
    SELECT account_id
    FROM expense
    GROUP BY account_id
    HAVING COUNT(id) > (
        SELECT COUNT(id) / COUNT(DISTINCT account_id) FROM expense WHERE account_id IS NOT NULL
    )
);

-- NQ-04: Find all recurring expenses whose cost is higher than any cafeteria expense
SELECT title, amount, frequency
FROM recurring_expenses
WHERE amount > ALL (
    SELECT amount
    FROM expense
    WHERE category_id = (SELECT id FROM category WHERE category_name = 'Food & Cafeteria')
);

-- NQ-05: Retrieve users who have configured a monthly budget for November 2026
SELECT username, full_name, email
FROM users
WHERE id IN (
    SELECT user_id
    FROM budget
    WHERE month = 'November' AND year = 2026
);

-- ============================================================================
-- 3. SET OPERATIONS (Phase 1 Requirement: Minimum 2 SET Operations, Each 1)
-- ============================================================================

-- SET-01: UNION — Combine all unique merchants from both Expense and Income streams
SELECT merchant AS counterparty, 'OUTFLOW (MERCHANT)' AS transaction_direction
FROM expense
WHERE merchant IS NOT NULL
UNION
SELECT source AS counterparty, 'INFLOW (PAYER)' AS transaction_direction
FROM incomes;

-- SET-02: INTERSECT — Find accounts that have experienced BOTH an outflow (expense) AND an inflow (income)
SELECT account_id FROM expense WHERE account_id IS NOT NULL
INTERSECT
SELECT account_id FROM incomes WHERE account_id IS NOT NULL;

-- SET-03: EXCEPT (MINUS) — Find categories that exist in the system but have ZERO logged expenses
SELECT id AS category_id, category_name FROM category WHERE category_type = 'EXPENSE'
EXCEPT
SELECT DISTINCT category_id, c.category_name 
FROM expense e JOIN category c ON e.category_id = c.id;

-- ============================================================================
-- 4. GROUP BY QUERIES (Phase 1 Requirement: Minimum 2 GROUP BY Queries)
-- ============================================================================

-- GRP-01: Group total spending, average ticket size, and transaction counts by category
SELECT 
    c.category_name,
    COUNT(e.id) AS transaction_count,
    SUM(e.amount) AS total_expenditure,
    ROUND(AVG(e.amount), 2) AS average_spend
FROM category c
LEFT JOIN expense e ON c.id = e.category_id
GROUP BY c.category_name
ORDER BY total_expenditure DESC;

-- GRP-02: Group total expenditure and transaction volume by payment method
SELECT 
    payment_method,
    COUNT(id) AS transaction_volume,
    SUM(amount) AS total_disbursed,
    ROUND((SUM(amount) * 100.0) / (SELECT SUM(amount) FROM expense), 2) AS volume_share_pct
FROM expense
GROUP BY payment_method
ORDER BY total_disbursed DESC;

-- ============================================================================
-- 5. HAVING QUERIES (Phase 1 Requirement: Minimum 2 HAVING Queries)
-- ============================================================================

-- HAV-01: Identify high-spend categories whose aggregate spending exceeds ₹1,000
SELECT 
    c.category_name,
    COUNT(e.id) AS transaction_count,
    SUM(e.amount) AS total_spend
FROM category c
JOIN expense e ON c.id = e.category_id
GROUP BY c.category_name
HAVING SUM(e.amount) > 1000.00
ORDER BY total_spend DESC;

-- HAV-02: Find payment channels utilized frequently (more than 3 transactions)
SELECT 
    payment_method,
    COUNT(id) AS txn_count,
    SUM(amount) AS total_amount
FROM expense
GROUP BY payment_method
HAVING COUNT(id) >= 3
ORDER BY txn_count DESC;

-- ============================================================================
-- 6. PATTERN MATCHING QUERIES (Phase 1 Requirement: Minimum 3 Queries)
-- ============================================================================

-- PAT-01: LIKE — Search transactions with merchant names starting with or containing specific tokens
SELECT id, name, merchant, amount, expense_date
FROM expense
WHERE merchant LIKE '%Vishwanath%' OR merchant LIKE 'Sarthak%'
ORDER BY expense_date DESC;

-- PAT-02: BETWEEN (Dates) — Retrieve all expenditures incurred in the first two weeks of November 2026
SELECT id, name, merchant, amount, expense_date
FROM expense
WHERE expense_date BETWEEN '2026-11-01' AND '2026-11-15'
ORDER BY expense_date ASC;

-- PAT-03: BETWEEN (Amounts) — Filter student micro-transactions between ₹50 and ₹500
SELECT id, name, merchant, amount, expense_date, payment_method
FROM expense
WHERE amount BETWEEN 50.00 AND 500.00
ORDER BY amount DESC;

-- ============================================================================
-- 7. CORRELATED QUERY (Phase 2 Requirement: Minimum 1 Correlated Query)
-- ============================================================================

-- COR-01: For each expense, calculate what percentage it represents of its category's total spending
SELECT 
    e.id,
    e.name,
    e.amount,
    c.category_name,
    ROUND((e.amount * 100.0) / (
        SELECT SUM(sub.amount) 
        FROM expense sub 
        WHERE sub.category_id = e.category_id
    ), 2) AS pct_of_category_total
FROM expense e
JOIN category c ON e.category_id = c.id
ORDER BY c.category_name, pct_of_category_total DESC;

-- ============================================================================
-- 8. DATABASE VIEWS (Phase 2 Requirement: Minimum 2 Views)
-- ============================================================================

-- VW-01: Query View 1 — Monthly Category Breakdown
SELECT * FROM view_monthly_expense_summary
WHERE calendar_year = 2026;

-- VW-02: Query View 2 — Account Liquidity & Health Metrics
SELECT * FROM view_account_health_metrics
ORDER BY current_balance DESC;

-- ============================================================================
-- 9. EXISTS AND NOT EXISTS QUERIES (Phase 2 Requirement: Minimum 1 Each = 2)
-- ============================================================================

-- EX-01: EXISTS — Retrieve categories that have at least one active expense logged
SELECT c.id, c.category_name
FROM category c
WHERE EXISTS (
    SELECT 1 
    FROM expense e 
    WHERE e.category_id = c.id
);

-- EX-02: NOT EXISTS — Identify payment accounts that have NEVER been used for any transaction
SELECT pa.id, pa.account_name, pa.account_type, pa.current_balance
FROM payment_accounts pa
WHERE NOT EXISTS (
    SELECT 1 
    FROM expense e 
    WHERE e.account_id = pa.id
);

-- ============================================================================
-- 10. AGGREGATE FUNCTIONS (Phase 2 Requirement: Minimum 4 Aggregate Functions)
-- ============================================================================

-- AGG-01: Combined comprehensive evaluation of COUNT, SUM, AVG, MIN, and MAX
SELECT 
    COUNT(id) AS total_expenses_recorded,
    SUM(amount) AS total_amount_spent,
    ROUND(AVG(amount), 2) AS average_expense_amount,
    MIN(amount) AS smallest_micro_transaction,
    MAX(amount) AS largest_single_expense
FROM expense
WHERE MONTH(expense_date) = 11 AND YEAR(expense_date) = 2026;

-- ============================================================================
-- 11. DATABASE TRIGGERS DEMO (Phase 2 Requirement: Minimum 2 Triggers)
-- ============================================================================

-- TRG-01 Demo: Inserting an expense automatically deducts from the account balance
-- Check balance before:
SELECT id, account_name, current_balance FROM payment_accounts WHERE id = 1;

-- Insert new transaction:
INSERT INTO expense (user_id, category_id, account_id, name, merchant, amount, expense_date, payment_method)
VALUES (2, 1, 1, 'Trigger Verification Coffee', 'Campus Cafe', 45.00, '2026-11-18', 'UPI');

-- Check balance after (Trigger automatically deducted ₹45.00):
SELECT id, account_name, current_balance FROM payment_accounts WHERE id = 1;

-- TRG-02 Demo: Deleting an expense automatically refunds the account balance
DELETE FROM expense WHERE name = 'Trigger Verification Coffee';

-- Check balance after delete (Trigger automatically credited ₹45.00 back):
SELECT id, account_name, current_balance FROM payment_accounts WHERE id = 1;

-- ============================================================================
-- 12. STORED PROCEDURES EXECUTION (Phase 2 Requirement: Minimum 2 Stored Procedures)
-- ============================================================================

-- SP-01: Execute inter-account fund transfer (Transfer ₹500 from Account 1 to Account 3)
CALL sp_transfer_funds(1, 3, 500.00, @transfer_msg);
SELECT @transfer_msg AS stored_procedure_result;

-- SP-02: Execute monthly budget reconciliation for November 2026
CALL sp_reconcile_monthly_budget(
    'November', 2026, 
    @budget_limit, @total_spent, @remaining_bal, @util_pct, @budget_status
);

SELECT 
    @budget_limit AS configured_budget,
    @total_spent AS actual_spend,
    @remaining_bal AS headroom_remaining,
    CONCAT(@util_pct, '%') AS utilization_percentage,
    @budget_status AS operational_status;
