package com.Sehrawat.SmartExpenseTracker.SavingsGoalModule;

import java.math.BigDecimal;
import java.util.List;

public interface SavingsGoalService {
    List<SavingsGoalDto> getAllSavingsGoals();
    SavingsGoalDto getSavingsGoalById(Long id);
    SavingsGoalDto createSavingsGoal(SavingsGoalDto dto);
    SavingsGoalDto updateSavingsGoal(Long id, SavingsGoalDto dto);
    void deleteSavingsGoal(Long id);
    SavingsGoalDto contributeToGoal(Long id, BigDecimal amount);
}
