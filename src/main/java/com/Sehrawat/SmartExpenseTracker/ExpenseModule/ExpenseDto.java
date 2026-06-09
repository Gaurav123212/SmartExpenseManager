package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseDto {

    private Long id;
    private String name;
    private BigDecimal amount;
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expenseDate;
    private Long categoryId;

}