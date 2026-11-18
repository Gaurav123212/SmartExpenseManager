package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import com.Sehrawat.SmartExpenseTracker.BudgetModule.BudgetRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.Budget;
import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseRepo;
import com.Sehrawat.SmartExpenseTracker.IncomeModule.IncomeRepo;
import com.Sehrawat.SmartExpenseTracker.RecurringModule.RecurringExpenseRepo;
import com.Sehrawat.SmartExpenseTracker.SavingsGoalModule.SavingsGoalRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ExpenseRepo expenseRepo;
    private final BudgetRepo budgetRepo;
    private final IncomeRepo incomeRepo;
    private final RecurringExpenseRepo recurringExpenseRepo;
    private final SavingsGoalRepo savingsGoalRepo;

    @Override
    public AnalyticsDto getBudgetStatus(String month, int year) {

        Budget budget = budgetRepo.findByMonthAndYear(month, year)
                .orElse(null);

        BigDecimal spent = expenseRepo.getTotalExpensesByMonthAndYear(month, year);
        if (spent == null) {
            spent = BigDecimal.ZERO;
        }

        if (budget == null) {
            AnalyticsDto dto = new AnalyticsDto();
            dto.setBudget(BigDecimal.ZERO);
            dto.setSpent(spent);
            dto.setRemaining(BigDecimal.ZERO.subtract(spent));
            dto.setPercentageUsed(0.0);
            dto.setStatus("NO BUDGET SET");
            return dto;
        }

        BigDecimal budgetLimit = budget.getMonthlyLimit();
        BigDecimal remaining = budgetLimit.subtract(spent);

        double percentageUsed = 0.0;
        if (budgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = spent.multiply(BigDecimal.valueOf(100))
                    .divide(budgetLimit, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        String status;
        double threshold = budget.getWarningThresholdPercent() != null ? budget.getWarningThresholdPercent() : 80.0;

        if (percentageUsed >= 100) {
            status = "BUDGET EXCEEDED";
        } else if (percentageUsed >= threshold) {
            status = "WARNING";
        } else {
            status = "WITHIN LIMIT";
        }

        AnalyticsDto analyticsDto = new AnalyticsDto();
        analyticsDto.setBudget(budgetLimit);
        analyticsDto.setSpent(spent);
        analyticsDto.setRemaining(remaining);
        analyticsDto.setPercentageUsed(percentageUsed);
        analyticsDto.setStatus(status);

        return analyticsDto;
    }

    @Override
    public MonthlyReportDto getMonthlyReport(String month, int year) {
        BigDecimal totalSpent = expenseRepo.getTotalExpensesByMonthAndYear(month, year);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;

        long expenseCount = expenseRepo.countExpensesByMonthAndYear(month, year);

        MonthlyReportDto dto = new MonthlyReportDto();
        dto.setMonth(month);
        dto.setYear(year);
        dto.setTotalSpent(totalSpent);
        dto.setExpenseCount(expenseCount);

        return dto;
    }

    @Override
    public List<SpendingTrendDto> getSpendingTrend(int year) {
        List<MonthlySpendingProjection> projections = expenseRepo.getMonthlySpendingTrend(year);

        return projections.stream()
                .map(p -> new SpendingTrendDto(
                        getMonthName(p.getMonth()),
                        p.getTotalSpent()
                ))
                .toList();
    }

    @Override
    public CashFlowDto getCashFlow(String month, int year) {
        BigDecimal income = incomeRepo.getTotalIncomeByMonthAndYear(month, year);
        if (income == null) income = BigDecimal.ZERO;

        BigDecimal expense = expenseRepo.getTotalExpensesByMonthAndYear(month, year);
        if (expense == null) expense = BigDecimal.ZERO;

        BigDecimal netSavings = income.subtract(expense);

        double savingsRate = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.multiply(BigDecimal.valueOf(100))
                    .divide(income, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        BigDecimal recurring = recurringExpenseRepo.getTotalActiveRecurringAmount();
        if (recurring == null) recurring = BigDecimal.ZERO;

        BigDecimal currentSavings = savingsGoalRepo.getTotalCurrentSavings();
        if (currentSavings == null) currentSavings = BigDecimal.ZERO;

        BigDecimal targetSavings = savingsGoalRepo.getTotalTargetSavings();
        if (targetSavings == null) targetSavings = BigDecimal.ZERO;

        return CashFlowDto.builder()
                .month(month)
                .year(year)
                .totalIncome(income)
                .totalExpense(expense)
                .netSavings(netSavings)
                .savingsRate(savingsRate)
                .recurringCommitment(recurring)
                .totalCurrentSavings(currentSavings)
                .totalTargetSavings(targetSavings)
                .build();
    }

    private String getMonthName(int month) {
        return switch (month) {
            case 1 -> "January";
            case 2 -> "February";
            case 3 -> "March";
            case 4 -> "April";
            case 5 -> "May";
            case 6 -> "June";
            case 7 -> "July";
            case 8 -> "August";
            case 9 -> "September";
            case 10 -> "October";
            case 11 -> "November";
            case 12 -> "December";
            default -> "Unknown";
        };
    }
}
