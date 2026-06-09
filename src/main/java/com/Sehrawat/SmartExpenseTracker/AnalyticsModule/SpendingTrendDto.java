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
public class SpendingTrendDto {

    private String month;
    private BigDecimal totalSpent;

}