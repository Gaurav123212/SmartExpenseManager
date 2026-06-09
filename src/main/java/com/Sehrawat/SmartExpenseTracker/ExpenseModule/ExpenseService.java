package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import java.util.List;

public interface ExpenseService {

    List<ExpenseDto> getAllExpenses();
    ExpenseDto getExpenseById(Long id);
    List<ExpenseDto> getExpenseByName(String name);
    ExpenseDto createExpense(ExpenseDto expenseDto);
    void deleteExpenseById(Long id);
    ExpenseDto updateExpense(Long id, ExpenseDto expenseDto);

}