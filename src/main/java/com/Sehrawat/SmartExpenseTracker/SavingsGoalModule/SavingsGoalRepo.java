package com.Sehrawat.SmartExpenseTracker.SavingsGoalModule;

import com.Sehrawat.SmartExpenseTracker.Entity.GoalStatus;
import com.Sehrawat.SmartExpenseTracker.Entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SavingsGoalRepo extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByStatus(GoalStatus status);

    @Query("SELECT COALESCE(SUM(g.targetAmount), 0) FROM SavingsGoal g")
    BigDecimal getTotalTargetSavings();

    @Query("SELECT COALESCE(SUM(g.currentAmount), 0) FROM SavingsGoal g")
    BigDecimal getTotalCurrentSavings();
}
