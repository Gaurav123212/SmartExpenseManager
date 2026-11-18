package com.Sehrawat.SmartExpenseTracker.IncomeModule;

import java.math.BigDecimal;
import java.util.List;

public interface IncomeService {
    List<IncomeDto> getAllIncomes();
    IncomeDto getIncomeById(Long id);
    IncomeDto createIncome(IncomeDto incomeDto);
    IncomeDto updateIncome(Long id, IncomeDto incomeDto);
    void deleteIncome(Long id);
    BigDecimal getTotalIncomeByMonthAndYear(String month, int year);
}
