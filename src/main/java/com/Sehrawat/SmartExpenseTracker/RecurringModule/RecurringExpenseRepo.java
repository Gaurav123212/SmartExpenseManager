package com.Sehrawat.SmartExpenseTracker.RecurringModule;

import com.Sehrawat.SmartExpenseTracker.Entity.RecurringExpense;
import com.Sehrawat.SmartExpenseTracker.Entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RecurringExpenseRepo extends JpaRepository<RecurringExpense, Long> {
    List<RecurringExpense> findByStatus(SubscriptionStatus status);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RecurringExpense r WHERE r.status = 'ACTIVE'")
    BigDecimal getTotalActiveRecurringAmount();
}
