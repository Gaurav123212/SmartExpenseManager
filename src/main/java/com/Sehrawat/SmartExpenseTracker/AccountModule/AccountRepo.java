package com.Sehrawat.SmartExpenseTracker.AccountModule;

import com.Sehrawat.SmartExpenseTracker.Entity.PaymentAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AccountRepo extends JpaRepository<PaymentAccount, Long> {
    List<PaymentAccount> findByActiveTrue();

    @Query("SELECT COALESCE(SUM(a.currentBalance), 0) FROM PaymentAccount a WHERE a.active = true")
    BigDecimal getTotalBalance();
}
