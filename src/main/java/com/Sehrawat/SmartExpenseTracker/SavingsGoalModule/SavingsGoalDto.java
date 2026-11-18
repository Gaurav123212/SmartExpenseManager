package com.Sehrawat.SmartExpenseTracker.SavingsGoalModule;

import com.Sehrawat.SmartExpenseTracker.Entity.GoalPriority;
import com.Sehrawat.SmartExpenseTracker.Entity.GoalStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SavingsGoalDto {
    private Long id;
    private String goalName;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal remainingAmount;
    private Double progressPercentage;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;
    private GoalPriority priority;
    private GoalStatus status;
    private Long linkedAccountId;
    private String linkedAccountName;
    private String color;
    private String notes;
    private LocalDateTime createdAt;
}
