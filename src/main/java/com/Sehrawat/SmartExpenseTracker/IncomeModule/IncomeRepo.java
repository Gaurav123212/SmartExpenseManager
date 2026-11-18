package com.Sehrawat.SmartExpenseTracker.IncomeModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IncomeRepo extends JpaRepository<Income, Long> {

    @Query("""
       SELECT COALESCE(SUM(i.amount), 0)
       FROM Income i
       WHERE FUNCTION('MONTHNAME', i.incomeDate) = :month
       AND FUNCTION('YEAR', i.incomeDate) = :year
       """)
    BigDecimal getTotalIncomeByMonthAndYear(@Param("month") String month, @Param("year") int year);

    @Query("""
       SELECT COALESCE(SUM(i.amount), 0)
       FROM Income i
       WHERE FUNCTION('YEAR', i.incomeDate) = :year
       """)
    BigDecimal getTotalIncomeByYear(@Param("year") int year);

    List<Income> findAllByOrderByIncomeDateDesc();
}
