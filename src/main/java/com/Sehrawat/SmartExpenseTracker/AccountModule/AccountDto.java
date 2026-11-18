package com.Sehrawat.SmartExpenseTracker.AccountModule;

import com.Sehrawat.SmartExpenseTracker.Entity.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountDto {
    private Long id;
    private String accountName;
    private AccountType accountType;
    private String institutionName;
    private String accountNumberMasked;
    private BigDecimal currentBalance;
    private BigDecimal creditLimit;
    private String currency;
    private Boolean active;
    private String color;
    private Integer expenseCount;
    private LocalDateTime createdAt;
}
