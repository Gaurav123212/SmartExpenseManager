package com.Sehrawat.SmartExpenseTracker.AccountModule;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {
    List<AccountDto> getAllAccounts();
    AccountDto getAccountById(Long id);
    AccountDto createAccount(AccountDto accountDto);
    AccountDto updateAccount(Long id, AccountDto accountDto);
    void deleteAccount(Long id);
    BigDecimal getTotalBalance();
}
