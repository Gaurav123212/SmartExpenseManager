package com.Sehrawat.SmartExpenseTracker.SecurityModule;

import com.Sehrawat.SmartExpenseTracker.AccountModule.AccountRepo;
import com.Sehrawat.SmartExpenseTracker.BudgetModule.BudgetRepo;
import com.Sehrawat.SmartExpenseTracker.CategoryModule.CategoryRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.*;
import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseRepo;
import com.Sehrawat.SmartExpenseTracker.IncomeModule.IncomeRepo;
import com.Sehrawat.SmartExpenseTracker.RecurringModule.RecurringExpenseRepo;
import com.Sehrawat.SmartExpenseTracker.SavingsGoalModule.SavingsGoalRepo;
import com.Sehrawat.SmartExpenseTracker.TagModule.TagRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final CategoryRepo categoryRepo;
    private final AccountRepo accountRepo;
    private final TagRepo tagRepo;
    private final BudgetRepo budgetRepo;
    private final ExpenseRepo expenseRepo;
    private final IncomeRepo incomeRepo;
    private final RecurringExpenseRepo recurringExpenseRepo;
    private final SavingsGoalRepo savingsGoalRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin User
        if (userRepo.count() == 0) {
            User defaultAdmin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .fullName("Gaurav Sehrawat")
                    .email("admin@smartexpense.io")
                    .currencyPreference("USD")
                    .build();
            userRepo.save(defaultAdmin);
            System.out.println("Default user created: admin / admin123");
        }

        // 2. Seed Categories with Icons & Color Palettes
        if (categoryRepo.count() == 0) {
            Category food = categoryRepo.save(Category.builder()
                    .categoryName("Food & Dining")
                    .categoryDescription("Restaurants, groceries, coffee, and dining out")
                    .categoryType(CategoryType.EXPENSE)
                    .colorCode("#f59e0b")
                    .icon("fa-utensils")
                    .build());

            Category housing = categoryRepo.save(Category.builder()
                    .categoryName("Housing & Rent")
                    .categoryDescription("Rent, mortgage, and property expenses")
                    .categoryType(CategoryType.EXPENSE)
                    .colorCode("#6366f1")
                    .icon("fa-house")
                    .build());

            Category tech = categoryRepo.save(Category.builder()
                    .categoryName("Technology & Software")
                    .categoryDescription("Subscriptions, hardware, software tools")
                    .categoryType(CategoryType.EXPENSE)
                    .colorCode("#06b6d4")
                    .icon("fa-laptop-code")
                    .build());

            Category transport = categoryRepo.save(Category.builder()
                    .categoryName("Transportation")
                    .categoryDescription("Fuel, public transit, car maintenance")
                    .categoryType(CategoryType.EXPENSE)
                    .colorCode("#ec4899")
                    .icon("fa-car")
                    .build());

            Category health = categoryRepo.save(Category.builder()
                    .categoryName("Health & Fitness")
                    .categoryDescription("Gym, medical, wellness, supplements")
                    .categoryType(CategoryType.EXPENSE)
                    .colorCode("#10b981")
                    .icon("fa-heart-pulse")
                    .build());

            Category salary = categoryRepo.save(Category.builder()
                    .categoryName("Primary Salary")
                    .categoryDescription("Monthly employment salary and wages")
                    .categoryType(CategoryType.INCOME)
                    .colorCode("#22c55e")
                    .icon("fa-money-bill-wave")
                    .build());
        }

        // 3. Seed Accounts
        if (accountRepo.count() == 0) {
            PaymentAccount checking = accountRepo.save(PaymentAccount.builder()
                    .accountName("Chase Premier Checking")
                    .accountType(AccountType.BANK_ACCOUNT)
                    .institutionName("JPMorgan Chase")
                    .accountNumberMasked("•••• 4821")
                    .currentBalance(new BigDecimal("6850.00"))
                    .currency("USD")
                    .active(true)
                    .color("#3b82f6")
                    .build());

            PaymentAccount amex = accountRepo.save(PaymentAccount.builder()
                    .accountName("Amex Gold Rewards")
                    .accountType(AccountType.CREDIT_CARD)
                    .institutionName("American Express")
                    .accountNumberMasked("•••• 9014")
                    .currentBalance(new BigDecimal("1240.00"))
                    .creditLimit(new BigDecimal("15000.00"))
                    .currency("USD")
                    .active(true)
                    .color("#f59e0b")
                    .build());

            PaymentAccount wallet = accountRepo.save(PaymentAccount.builder()
                    .accountName("Physical Cash & Vault")
                    .accountType(AccountType.CASH)
                    .institutionName("Cash Wallet")
                    .accountNumberMasked("CASH")
                    .currentBalance(new BigDecimal("450.00"))
                    .currency("USD")
                    .active(true)
                    .color("#10b981")
                    .build());
        }

        // 4. Seed Tags
        if (tagRepo.count() == 0) {
            tagRepo.save(Tag.builder().name("TaxDeductible").color("#10b981").description("Eligible for annual tax deduction").build());
            tagRepo.save(Tag.builder().name("Business").color("#6366f1").description("Business related expenditure").build());
            tagRepo.save(Tag.builder().name("Subscription").color("#06b6d4").description("Recurring subscription bill").build());
            tagRepo.save(Tag.builder().name("Groceries").color("#f59e0b").description("Supermarket grocery trip").build());
            tagRepo.save(Tag.builder().name("Travel").color("#ec4899").description("Vacation and flight tickets").build());
        }

        // 5. Seed Recurring Subscriptions
        if (recurringExpenseRepo.count() == 0) {
            Category techCat = categoryRepo.findByCategoryName("Technology & Software").orElse(null);
            Category healthCat = categoryRepo.findByCategoryName("Health & Fitness").orElse(null);
            PaymentAccount checking = accountRepo.findAll().stream().findFirst().orElse(null);

            recurringExpenseRepo.save(RecurringExpense.builder()
                    .title("Netflix 4K Ultra")
                    .amount(new BigDecimal("22.99"))
                    .frequency(RecurrenceFrequency.MONTHLY)
                    .startDate(LocalDate.now().minusMonths(6))
                    .nextDueDate(LocalDate.now().plusDays(8))
                    .autoPay(true)
                    .status(SubscriptionStatus.ACTIVE)
                    .category(techCat)
                    .paymentAccount(checking)
                    .notes("Standard family streaming plan")
                    .build());

            recurringExpenseRepo.save(RecurringExpense.builder()
                    .title("Equinox Fitness Membership")
                    .amount(new BigDecimal("89.00"))
                    .frequency(RecurrenceFrequency.MONTHLY)
                    .startDate(LocalDate.now().minusMonths(3))
                    .nextDueDate(LocalDate.now().plusDays(14))
                    .autoPay(true)
                    .status(SubscriptionStatus.ACTIVE)
                    .category(healthCat)
                    .paymentAccount(checking)
                    .notes("Monthly gym & spa access")
                    .build());

            recurringExpenseRepo.save(RecurringExpense.builder()
                    .title("AWS Cloud Server Tier")
                    .amount(new BigDecimal("48.50"))
                    .frequency(RecurrenceFrequency.MONTHLY)
                    .startDate(LocalDate.now().minusMonths(1))
                    .nextDueDate(LocalDate.now().plusDays(20))
                    .autoPay(false)
                    .status(SubscriptionStatus.ACTIVE)
                    .category(techCat)
                    .paymentAccount(checking)
                    .notes("Production cloud instances")
                    .build());
        }

        // 6. Seed Savings Goals
        if (savingsGoalRepo.count() == 0) {
            PaymentAccount checking = accountRepo.findAll().stream().findFirst().orElse(null);

            savingsGoalRepo.save(SavingsGoal.builder()
                    .goalName("Emergency Fund (6 Months)")
                    .targetAmount(new BigDecimal("12000.00"))
                    .currentAmount(new BigDecimal("8250.00"))
                    .targetDate(LocalDate.now().plusMonths(5))
                    .priority(GoalPriority.URGENT)
                    .status(GoalStatus.IN_PROGRESS)
                    .linkedAccount(checking)
                    .color("#3b82f6")
                    .notes("Safety net fund deposited in high yield savings")
                    .build());

            savingsGoalRepo.save(SavingsGoal.builder()
                    .goalName("Tokyo & Kyoto Autumn Tour")
                    .targetAmount(new BigDecimal("5000.00"))
                    .currentAmount(new BigDecimal("3600.00"))
                    .targetDate(LocalDate.now().plusMonths(8))
                    .priority(GoalPriority.HIGH)
                    .status(GoalStatus.IN_PROGRESS)
                    .linkedAccount(checking)
                    .color("#ec4899")
                    .notes("Two-week cultural expedition")
                    .build());

            savingsGoalRepo.save(SavingsGoal.builder()
                    .goalName("High-End Workstation Setup")
                    .targetAmount(new BigDecimal("3500.00"))
                    .currentAmount(new BigDecimal("3500.00"))
                    .targetDate(LocalDate.now().minusDays(10))
                    .priority(GoalPriority.MEDIUM)
                    .status(GoalStatus.ACHIEVED)
                    .linkedAccount(checking)
                    .color("#10b981")
                    .notes("M3 Max Studio + Pro Display XDR")
                    .build());
        }

        // 7. Seed Income if empty
        LocalDate today = LocalDate.now();
        String currentMonth = today.getMonth().name().substring(0, 1) + today.getMonth().name().substring(1).toLowerCase();
        int currentYear = today.getYear();

        if (incomeRepo.count() == 0) {
            Category salaryCat = categoryRepo.findByCategoryName("Primary Salary").orElse(null);
            PaymentAccount checking = accountRepo.findAll().stream().findFirst().orElse(null);

            incomeRepo.save(Income.builder()
                    .source("Software Engineering Monthly Salary")
                    .amount(new BigDecimal("5200.00"))
                    .incomeDate(LocalDate.of(currentYear, today.getMonth(), 1))
                    .category(salaryCat)
                    .paymentAccount(checking)
                    .paymentMethod(PaymentMethod.BANK_TRANSFER)
                    .notes("Direct deposit paycheck")
                    .build());
        }

        // 8. Seed Budget if empty
        if (!budgetRepo.existsByMonthAndYear(currentMonth, currentYear)) {
            budgetRepo.save(Budget.builder()
                    .month(currentMonth)
                    .year(currentYear)
                    .monthlyLimit(new BigDecimal("3500.00"))
                    .warningThresholdPercent(80.0)
                    .notes("Standard monthly operating budget")
                    .build());
        }
    }
}
