package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetDto {

    private Long id;

    private BigDecimal monthlyLimit;
    private String month;
    private int year;

}