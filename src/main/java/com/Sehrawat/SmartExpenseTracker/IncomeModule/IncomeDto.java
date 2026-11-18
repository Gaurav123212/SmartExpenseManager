package com.Sehrawat.SmartExpenseTracker.IncomeModule;

import com.Sehrawat.SmartExpenseTracker.Entity.PaymentMethod;
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
public class IncomeDto {
    private Long id;
    private String source;
    private BigDecimal amount;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate incomeDate;
    private Long categoryId;
    private String categoryName;
    private Long accountId;
    private String accountName;
    private PaymentMethod paymentMethod;
    private String notes;
    private LocalDateTime createdAt;
}
