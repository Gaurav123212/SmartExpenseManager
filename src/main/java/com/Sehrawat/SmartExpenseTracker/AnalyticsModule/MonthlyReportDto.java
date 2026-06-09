package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyReportDto {

    private String month;

    private int year;

    private BigDecimal totalSpent;

    private long expenseCount;

}