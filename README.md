# SmartExpenseTracker — Premium Financial Analytics, Wealth & Cash Flow Manager

SmartExpenseTracker is a high-fidelity, sleek, and modern web application designed to track, analyze, and optimize personal spending habits, cash flow, liquid net worth, recurring subscriptions, and savings milestones in real-time. Built with a premium glassmorphic dark user interface on the frontend and a secure, enterprise-grade Spring Boot REST API on the backend.

---

## 🚀 Key Features

### 🔒 Modern Security (Powered by Spring Security)
* **Database-Backed Authentication**: Register accounts and sign in securely. User passwords are automatically hashed using **BCrypt**.
* **Seamless Login/Logout**: Glassmorphic custom login screen with dynamic transitions between signing in and signing up. Session control automatically intercepts unauthorized requests and provides smooth redirects.
* **Auto-Seeded Administrator**: Auto-seeds a default administrative user (`admin`/`admin123`) on application startup.
* **Centralized API Security**: All REST endpoints are secured under a centralized security filter chain.

### 💳 Multi-Account & Portfolio Manager (NEW TABLE: `payment_accounts`)
* **Multi-Account Support**: Manage Checking accounts, Credit Cards, Digital Wallets, Cash Wallets, and Investment Portfolios.
* **Live Net Liquid Balance**: Real-time aggregated balance tracking across all active payment methods.
* **Credit Limit & Utilization Meter**: Live tracking of credit card utilization against assigned credit limits.
* **Auto-Balance Deduction & Credit**: Adding or deleting expenses/incomes automatically synchronizes account balances in real-time.

### 💵 Income & Cash Flow Tracking (NEW TABLE: `incomes`)
* **Inflow Ledger**: Log income sources (salary, freelance, dividends, rental income) with dates, deposited accounts, and payment methods.
* **Net Cash Flow KPI**: Live dashboard calculation of **Total Income - Total Expenses = Net Monthly Savings**.
* **Savings Rate %**: Tracks your percentage of income saved each month.

### 🔁 Subscriptions & Scheduled Bills (NEW TABLE: `recurring_expenses`)
* **Subscription Management**: Monitor Netflix, Gym, AWS, Rent, and insurance commitments with custom billing frequencies (Daily, Weekly, Monthly, Quarterly, Yearly).
* **Upcoming Bill Reminders**: Automatic dynamic calculation of days until next due date (`Due Today / Overdue`, `Due in X days`).
* **One-Click "Pay & Advance"**: Clicking Pay automatically records an expense in your transaction ledger, deducts funds from the linked account, and rolls the due date forward to the next billing cycle.

### 🎯 Target Savings Goals (NEW TABLE: `savings_goals`)
* **Goal Setting**: Plan milestones (Emergency Fund, Vacations, Tech Upgrades) with target deadlines, priority levels (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), and linked accounts.
* **Visual Progress Tracker**: Dynamic gradient progress bars with completion percentages and remaining funding needed.
* **Quick Contribution/Deposit Modal**: Deposit funds towards any savings goal with automatic transition to `ACHIEVED` once the target is reached.

### 🏷️ Multi-Tagging & Taxonomy (NEW TABLE: `tags` & `expense_tags`)
* **Many-to-Many Tags**: Tag expenses with labels like `#TaxDeductible`, `#Business`, `#Travel`, `#Groceries`.
* **Tag-based Auditing**: Easily audit business and tax-deductible items.

### 📂 Hierarchical Categories (ENHANCED TABLE: `category`)
* **Subcategory Support**: Self-referencing parent-child relationships allowing nested subcategories (e.g. Food & Dining → Groceries, Restaurants).
* **Visual Icon & Color Palettes**: Categories feature FontAwesome icons and custom accent colors for rich visual distinction.
* **Category Classification**: Categorize buckets as `EXPENSE` or `INCOME`.

### 📊 Monthly Budgets & Warning Triggers (ENHANCED TABLE: `budget`)
* **Category-Specific or Global Budgets**: Set overarching monthly caps or budget specifically per category.
* **Configurable Warning Thresholds**: Trigger automatic dashboard alert banners when spending reaches 80% (or custom threshold) of the budget cap.

### 📈 Real-Time Analytics & Reports
* **Monthly Utilization Gauge**: Visualizes budget consumption using an interactive SVG progress ring.
* **Category Distribution**: Dynamic Chart.js doughnut chart breaking down spending by category.
* **Annual Spending Trends**: Smooth Bezier line chart analyzing month-by-month expenditure over the year.

---

## 🛠️ Technology Stack

### Backend
* **Language/Platform**: Java 21+
* **Framework**: Spring Boot 4.0.6 (Spring WebMVC, Spring Security, Spring Data JPA)
* **ORM / Database**: Hibernate, MySQL (Connector/J)
* **Utilities**: Lombok, ModelMapper

### Frontend
* **UI Design**: Vanilla HTML5 & CSS3 featuring a custom Glassmorphic dark mode design system (custom tokens, gradients, micro-animations, and blur filters).
* **Interactions**: Vanilla JavaScript (Fetch API for session-based asynchronous communication).
* **Visualizations**: Chart.js (via CDN).
* **Icons & Fonts**: FontAwesome v6, Google Fonts (Plus Jakarta Sans).

---

## 💻 Database Schema Architecture

The application connects to a MySQL database and automatically creates and updates tables using Hibernate (`ddl-auto=update`):

1. **`users`**: User credentials (`id`, `username`, `password`, `role`, `fullName`, `email`, `currencyPreference`, `createdAt`).
2. **`category`**: Spending and income categories with icons, color codes, classification, and self-referencing hierarchy (`parent_category_id`).
3. **`payment_accounts`**: Financial accounts (`accountName`, `accountType`, `institutionName`, `accountNumberMasked`, `currentBalance`, `creditLimit`, `color`).
4. **`expense`**: Individual transactions (`name`, `merchant`, `amount`, `expenseDate`, `category_id`, `account_id`, `paymentMethod`, `paymentStatus`, `isRecurring`).
5. **`tags`**: Reusable tags (`name`, `color`, `description`).
6. **`expense_tags`**: Many-to-many join table connecting `expense` and `tags`.
7. **`incomes`**: Inflow transactions (`source`, `amount`, `incomeDate`, `category_id`, `account_id`, `paymentMethod`, `notes`).
8. **`recurring_expenses`**: Subscriptions and bills (`title`, `amount`, `frequency`, `startDate`, `nextDueDate`, `category_id`, `account_id`, `status`, `autoPay`).
9. **`savings_goals`**: Milestones and savings targets (`goalName`, `targetAmount`, `currentAmount`, `targetDate`, `priority`, `status`, `account_id`, `color`).
10. **`budget`**: Monthly expenditure limits with optional category links and alert thresholds (`monthlyLimit`, `month`, `year`, `category_id`, `warningThresholdPercent`).

---

## 🏁 Setup & Execution Instructions

### Prerequisites
* Java JDK 21 or higher installed.
* Maven installed (or use `./mvnw` / `mvnw.cmd`).
* MySQL Server running with database `expense_tracker`:
  ```sql
  CREATE DATABASE expense_tracker;
  ```

### Build & Run
```bash
# Compile and build
mvn clean compile

# Run tests
mvn test

# Start the application
mvn spring-boot:run
```

Access the application in your browser:
* **URL**: `http://localhost:8081`
* **Default Admin Username**: `admin`
* **Default Admin Password**: `admin123`
