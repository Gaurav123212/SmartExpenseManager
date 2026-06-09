# SmartExpenseTracker — Premium Financial Analytics & Expense Manager

SmartExpenseTracker is a high-fidelity, sleek, and modern web application designed to track, analyze, and optimize personal spending habits in real-time. Built with a premium glassmorphic dark user interface on the frontend and a secure Spring Boot REST API on the backend, it serves as a complete solution for personal budget management.

---

## 🚀 Key Features

### 🔒 Modern Security (Powered by Spring Security)
* **Database-Backed Authentication**: Register accounts and sign in securely. User passwords are automatically hashed using **BCrypt** before database storage.
* **Seamless Login/Logout**: Features a beautiful glassmorphic custom login screen with dynamic transitions between signing in and signing up. Session control automatically intercepts unauthorized requests and provides smooth redirects.
* **Auto-Seeded Administrator**: Auto-seeds a default administrative user (`admin`/`admin123`) on application startup if the database contains no users, facilitating instant access.
* **Secured REST API**: All endpoints (`/expenses`, `/categories`, `/budgets`, `/analytics`) are secured under a centralized security filter chain.

### 📊 Real-Time Analytics & Reports
* **Dashboard Stats**: Live tracking of *Total Spent*, *Active Budget Limit*, *Remaining Balance*, and *Total Transaction Count*.
* **Monthly Utilization Gauge**: Visualizes budget consumption using an interactive progress ring.
* **Category Distribution**: Dynamic pie charts displaying expense distribution across categories.
* **Annual Spending Trends**: Line charts analyzing month-by-month spending trends throughout the year.
* **Monthly PDF-like Reports**: Quick generation of comprehensive financial reports for any given month/year.

### 💸 Core Operations
* **Expenses**: Full CRUD support. Search transactions in real-time, filter by category, sort by date/amount, and quick-add transactions directly from the dashboard.
* **Categories**: Define and search custom expense categories.
* **Monthly Budgets**: Set spending limit targets for specific month-year pairings. An automatic warning banner triggers on the dashboard when spending exceeds **80%** of the active budget limit.

---

## 🛠️ Technology Stack

### Backend
* **Language/Platform**: Java 21+
* **Framework**: Spring Boot 4.0.6 (Spring WebMVC, Spring Security, Spring Data JPA)
* **ORM / Database**: Hibernate, MySQL (Connector/J)
* **Utilities**: Lombok, ModelMapper

### Frontend
* **UI Design**: Vanilla HTML5 & CSS3 featuring a custom Glassmorphic dark mode design system (using custom tokens, gradients, micro-animations, and blur filters).
* **Interactions**: Vanilla JavaScript (Fetch API for session-based asynchronous communication).
* **Visualizations**: Chart.js (via CDN).
* **Icons & Fonts**: FontAwesome v6, Google Fonts (Plus Jakarta Sans).

---

## 💻 Database Setup & Structure

The application connects to a MySQL database and automatically creates/migrates tables using Hibernate (`ddl-auto=update`).

### Database Configuration
Ensure MySQL is running, and configure your credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Table Schema Generated
1. **users**: Stores authentication credentials.
2. **category**: Manages custom categories for tracking.
3. **budget**: Holds the set monthly expenditure limits.
4. **expense**: Tracks individual financial transactions.

---

## 🏁 Setup & Execution Instructions

### Prerequisites
* Java JDK 21 or higher installed.
* Maven installed (or use the included wrapper `./mvnw`).
* MySQL Server installed and running.
* A database named `expense_tracker` created in MySQL:
  ```sql
  CREATE DATABASE expense_tracker;
  ```

### Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Gaurav123212/SmartExpenseManager.git
   cd SmartExpenseManager
   ```

2. **Verify Database Configuration**:
   Update `src/main/resources/application.properties` with your database credentials.

3. **Build the Application**:
   Compile the source files and download dependencies:
   ```bash
   # Windows
   mvnw.cmd clean compile
   
   # macOS/Linux
   ./mvnw clean compile
   ```

4. **Run Tests**:
   Ensure all configurations and integrations boot correctly:
   ```bash
   # Windows
   mvnw.cmd test
   
   # macOS/Linux
   ./mvnw test
   ```

5. **Start the Server**:
   Launch the Spring Boot development server (running on port `8081`):
   ```bash
   # Windows
   mvnw.cmd spring-boot:run
   
   # macOS/Linux
   ./mvnw spring-boot:run
   ```

6. **Open in Browser**:
   Navigate to `http://localhost:8081/`. You will automatically be redirected to the custom login screen (`/login.html`).

---

## 🔑 Accessing the App

### Default Credentials
On startup, a default administrator is created for initial access:
* **Username**: `admin`
* **Password**: `admin123`

### Registering New Users
1. On the login screen, click the **"Sign Up"** tab.
2. Choose a new username and password, then click **"Create Account"**.
3. Upon success, you will be redirected to the **"Sign In"** tab where you can log in with your newly registered credentials.

### Logging Out
Click the **Logout** button (red power icon) located at the bottom-right corner of the sidebar footer to terminate your session.
