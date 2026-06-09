package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Month;
import java.util.List;
import java.util.Optional;

public interface BudgetRepo extends JpaRepository<Budget, Long> {

    boolean existsByMonthAndYear(String month, int year);
    Optional<Budget> findByMonthAndYear(String month, int year);
    List<Budget> findByMonth(String month);
    List<Budget> findByYear(int year);

}
