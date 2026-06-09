package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import java.util.List;

public interface AnalyticsService {

    AnalyticsDto getBudgetStatus(String month, int year);
    MonthlyReportDto getMonthlyReport(String month, int year);
    List<SpendingTrendDto> getSpendingTrend(int year);
}