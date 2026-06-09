package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import java.util.List;

public interface BudgetService {

    BudgetDto createBudget(BudgetDto budgetDto);
    List<BudgetDto> getAllBudgets();
    BudgetDto getBudgetById(Long id);
    //List<BudgetDto> getBudgetsByMonthAndYear(String month, int year);
    List<BudgetDto> getBudgetByMonth(String month);
    BudgetDto updateBudget(BudgetDto budgetDto);
    void deleteBudgetById(Long id);

}