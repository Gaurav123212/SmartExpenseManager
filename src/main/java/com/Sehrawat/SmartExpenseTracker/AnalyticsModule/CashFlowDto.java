package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CashFlowDto {
    private String month;
    private int year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private double savingsRate;
    private BigDecimal recurringCommitment;
    private BigDecimal totalCurrentSavings;
    private BigDecimal totalTargetSavings;
}
