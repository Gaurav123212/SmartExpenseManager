package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BudgetDto {

    private Long id;
    private BigDecimal monthlyLimit;
    private String month;
    private Integer year;
    private Long categoryId;
    private String categoryName;
    private Double warningThresholdPercent;
    private String notes;

}
