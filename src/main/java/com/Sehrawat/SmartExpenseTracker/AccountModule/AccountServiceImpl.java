package com.Sehrawat.SmartExpenseTracker.AccountModule;

import com.Sehrawat.SmartExpenseTracker.Entity.AccountType;
import com.Sehrawat.SmartExpenseTracker.Entity.PaymentAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepo accountRepo;

    private AccountDto toDto(PaymentAccount account) {
        if (account == null) return null;
        return AccountDto.builder()
                .id(account.getId())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .institutionName(account.getInstitutionName())
                .accountNumberMasked(account.getAccountNumberMasked())
                .currentBalance(account.getCurrentBalance())
                .creditLimit(account.getCreditLimit())
                .currency(account.getCurrency() != null ? account.getCurrency() : "USD")
                .active(account.isActive())
                .color(account.getColor() != null ? account.getColor() : "#6366f1")
                .expenseCount(account.getExpenses() != null ? account.getExpenses().size() : 0)
                .createdAt(account.getCreatedAt())
                .build();
    }

    @Override
    public List<AccountDto> getAllAccounts() {
        return accountRepo.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public AccountDto getAccountById(Long id) {
        PaymentAccount account = accountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return toDto(account);
    }

    @Override
    public AccountDto createAccount(AccountDto dto) {
        PaymentAccount account = PaymentAccount.builder()
                .accountName(dto.getAccountName())
                .accountType(dto.getAccountType() != null ? dto.getAccountType() : AccountType.BANK_ACCOUNT)
                .institutionName(dto.getInstitutionName())
                .accountNumberMasked(dto.getAccountNumberMasked())
                .currentBalance(dto.getCurrentBalance() != null ? dto.getCurrentBalance() : BigDecimal.ZERO)
                .creditLimit(dto.getCreditLimit())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "USD")
                .active(true)
                .color(dto.getColor() != null ? dto.getColor() : "#6366f1")
                .build();
        PaymentAccount saved = accountRepo.save(account);
        return toDto(saved);
    }

    @Override
    public AccountDto updateAccount(Long id, AccountDto dto) {
        PaymentAccount account = accountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setAccountName(dto.getAccountName());
        if (dto.getAccountType() != null) {
            account.setAccountType(dto.getAccountType());
        }
        account.setInstitutionName(dto.getInstitutionName());
        account.setAccountNumberMasked(dto.getAccountNumberMasked());
        if (dto.getCurrentBalance() != null) {
            account.setCurrentBalance(dto.getCurrentBalance());
        }
        account.setCreditLimit(dto.getCreditLimit());
        if (dto.getCurrency() != null) {
            account.setCurrency(dto.getCurrency());
        }
        if (dto.getActive() != null) {
            account.setActive(dto.getActive());
        }
        if (dto.getColor() != null) {
            account.setColor(dto.getColor());
        }

        PaymentAccount updated = accountRepo.save(account);
        return toDto(updated);
    }

    @Override
    public void deleteAccount(Long id) {
        PaymentAccount account = accountRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        accountRepo.delete(account);
    }

    @Override
    public BigDecimal getTotalBalance() {
        return accountRepo.getTotalBalance();
    }
}
