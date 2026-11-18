package com.Sehrawat.SmartExpenseTracker.RecurringModule;

import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseDto;

import java.math.BigDecimal;
import java.util.List;

public interface RecurringExpenseService {
    List<RecurringExpenseDto> getAllRecurringExpenses();
    RecurringExpenseDto getRecurringExpenseById(Long id);
    RecurringExpenseDto createRecurringExpense(RecurringExpenseDto dto);
    RecurringExpenseDto updateRecurringExpense(Long id, RecurringExpenseDto dto);
    void deleteRecurringExpense(Long id);
    ExpenseDto processPayment(Long id);
    BigDecimal getTotalActiveMonthlyCommitment();
}
