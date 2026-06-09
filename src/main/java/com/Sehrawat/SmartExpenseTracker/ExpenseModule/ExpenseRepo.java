package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import com.Sehrawat.SmartExpenseTracker.AnalyticsModule.MonthlySpendingProjection;
import com.Sehrawat.SmartExpenseTracker.Entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepo extends JpaRepository<Expense, Long> {

    List<Expense> findByName(String name);
    //BigDecimal getTotalExpensesByMonthAndYear(String month, int year);

    @Query("""
       SELECT COALESCE(SUM(e.amount), 0)
       FROM Expense e
       WHERE FUNCTION('MONTHNAME', e.expenseDate) = :month
       AND FUNCTION('YEAR', e.expenseDate) = :year
       """)

    BigDecimal getTotalExpensesByMonthAndYear(@Param("month") String month, @Param("year") int year);

    @Query("""
       SELECT COUNT(e)
       FROM Expense e
       WHERE FUNCTION('MONTHNAME', e.expenseDate) = :month
       AND FUNCTION('YEAR', e.expenseDate) = :year
       """)
    long countExpensesByMonthAndYear(@Param("month") String month, @Param("year") int year);

    @Query("""
       SELECT
       MONTH(e.expenseDate) as month,
       SUM(e.amount) as totalSpent
       FROM Expense e
       WHERE YEAR(e.expenseDate) = :year
       GROUP BY MONTH(e.expenseDate)
       ORDER BY MONTH(e.expenseDate)
       """)
    List<MonthlySpendingProjection> getMonthlySpendingTrend(
            @Param("year") int year);

}