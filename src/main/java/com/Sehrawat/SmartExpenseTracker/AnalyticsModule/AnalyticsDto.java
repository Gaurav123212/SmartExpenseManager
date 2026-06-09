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
public class AnalyticsDto {

    private BigDecimal budget;

    private BigDecimal spent;

    private BigDecimal remaining;

    private double percentageUsed;

    private String status;

}