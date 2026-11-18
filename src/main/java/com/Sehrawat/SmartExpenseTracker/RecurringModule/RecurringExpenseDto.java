package com.Sehrawat.SmartExpenseTracker.RecurringModule;

import com.Sehrawat.SmartExpenseTracker.Entity.RecurrenceFrequency;
import com.Sehrawat.SmartExpenseTracker.Entity.SubscriptionStatus;
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
public class RecurringExpenseDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private RecurrenceFrequency frequency;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextDueDate;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Long accountId;
    private String accountName;
    private Boolean autoPay;
    private SubscriptionStatus status;
    private Integer reminderDaysBefore;
    private String notes;
    private Long daysUntilDue;
    private LocalDateTime createdAt;
}
