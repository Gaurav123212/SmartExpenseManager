package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import java.math.BigDecimal;

public interface MonthlySpendingProjection {

    Integer getMonth();

    BigDecimal getTotalSpent();
}