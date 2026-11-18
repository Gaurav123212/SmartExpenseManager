package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import com.Sehrawat.SmartExpenseTracker.Entity.PaymentMethod;
import com.Sehrawat.SmartExpenseTracker.Entity.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseDto {

    private Long id;
    private String name;
    private BigDecimal amount;
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expenseDate;

    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;

    private Long accountId;
    private String accountName;

    private String merchant;
    private String referenceNumber;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Boolean isRecurring;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private LocalDateTime createdAt;

}
