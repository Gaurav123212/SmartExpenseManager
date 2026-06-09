package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import com.Sehrawat.SmartExpenseTracker.BudgetModule.BudgetRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.Budget;
import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseRepo;
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

    @Override
    public AnalyticsDto getBudgetStatus(String month, int year) {

        Budget budget = budgetRepo.findByMonthAndYear(month, year)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        BigDecimal spent =
                expenseRepo.getTotalExpensesByMonthAndYear(month, year);

        if (spent == null) {
            spent = BigDecimal.ZERO;
        }

        BigDecimal budgetLimit = budget.getMonthlyLimit();

        BigDecimal remaining =
                budgetLimit.subtract(spent);

        double percentageUsed =
                spent.multiply(BigDecimal.valueOf(100))
                        .divide(budgetLimit, 2, RoundingMode.HALF_UP)
                        .doubleValue();

        String status;

        if (percentageUsed >= 100) {
            status = "BUDGET EXCEEDED";
        } else if (percentageUsed >= 90) {
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
        BigDecimal totalSpent =
                expenseRepo.getTotalExpensesByMonthAndYear(month, year);

        long expenseCount =
                expenseRepo.countExpensesByMonthAndYear(month, year);

        MonthlyReportDto dto = new MonthlyReportDto();

        dto.setMonth(month);
        dto.setYear(year);
        dto.setTotalSpent(totalSpent);
        dto.setExpenseCount(expenseCount);

        return dto;
    }

    @Override
    public List<SpendingTrendDto> getSpendingTrend(int year) {
        List<MonthlySpendingProjection> projections =
                expenseRepo.getMonthlySpendingTrend(year);

        return projections.stream()
                .map(p -> new SpendingTrendDto(
                        getMonthName(p.getMonth()),
                        p.getTotalSpent()
                ))
                .toList();
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