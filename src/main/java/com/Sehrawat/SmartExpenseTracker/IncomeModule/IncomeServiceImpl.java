package com.Sehrawat.SmartExpenseTracker.IncomeModule;

import com.Sehrawat.SmartExpenseTracker.AccountModule.AccountRepo;
import com.Sehrawat.SmartExpenseTracker.CategoryModule.CategoryRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.Category;
import com.Sehrawat.SmartExpenseTracker.Entity.Income;
import com.Sehrawat.SmartExpenseTracker.Entity.PaymentAccount;
import com.Sehrawat.SmartExpenseTracker.Entity.PaymentMethod;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepo incomeRepo;
    private final CategoryRepo categoryRepo;
    private final AccountRepo accountRepo;

    private IncomeDto toDto(Income income) {
        if (income == null) return null;
        return IncomeDto.builder()
                .id(income.getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .incomeDate(income.getIncomeDate())
                .categoryId(income.getCategory() != null ? income.getCategory().getId() : null)
                .categoryName(income.getCategory() != null ? income.getCategory().getCategoryName() : "General Income")
                .accountId(income.getPaymentAccount() != null ? income.getPaymentAccount().getId() : null)
                .accountName(income.getPaymentAccount() != null ? income.getPaymentAccount().getAccountName() : "None")
                .paymentMethod(income.getPaymentMethod() != null ? income.getPaymentMethod() : PaymentMethod.BANK_TRANSFER)
                .notes(income.getNotes())
                .createdAt(income.getCreatedAt())
                .build();
    }

    @Override
    public List<IncomeDto> getAllIncomes() {
        return incomeRepo.findAllByOrderByIncomeDateDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public IncomeDto getIncomeById(Long id) {
        Income income = incomeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));
        return toDto(income);
    }

    @Override
    @Transactional
    public IncomeDto createIncome(IncomeDto dto) {
        Income income = Income.builder()
                .source(dto.getSource())
                .amount(dto.getAmount())
                .incomeDate(dto.getIncomeDate() != null ? dto.getIncomeDate() : LocalDate.now())
                .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : PaymentMethod.BANK_TRANSFER)
                .notes(dto.getNotes())
                .build();

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId()).orElse(null);
            income.setCategory(category);
        }

        if (dto.getAccountId() != null) {
            PaymentAccount account = accountRepo.findById(dto.getAccountId()).orElse(null);
            if (account != null) {
                income.setPaymentAccount(account);
                // Deposit into account balance
                if (income.getAmount() != null) {
                    account.setCurrentBalance(account.getCurrentBalance().add(income.getAmount()));
                    accountRepo.save(account);
                }
            }
        }

        Income saved = incomeRepo.save(income);
        return toDto(saved);
    }

    @Override
    @Transactional
    public IncomeDto updateIncome(Long id, IncomeDto dto) {
        Income income = incomeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        // Reverse old amount from previous account
        if (income.getPaymentAccount() != null && income.getAmount() != null) {
            PaymentAccount oldAcc = income.getPaymentAccount();
            oldAcc.setCurrentBalance(oldAcc.getCurrentBalance().subtract(income.getAmount()));
            accountRepo.save(oldAcc);
        }

        income.setSource(dto.getSource());
        income.setAmount(dto.getAmount());
        if (dto.getIncomeDate() != null) {
            income.setIncomeDate(dto.getIncomeDate());
        }
        if (dto.getPaymentMethod() != null) {
            income.setPaymentMethod(dto.getPaymentMethod());
        }
        income.setNotes(dto.getNotes());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId()).orElse(null);
            income.setCategory(category);
        } else {
            income.setCategory(null);
        }

        if (dto.getAccountId() != null) {
            PaymentAccount newAcc = accountRepo.findById(dto.getAccountId()).orElse(null);
            if (newAcc != null) {
                income.setPaymentAccount(newAcc);
                if (income.getAmount() != null) {
                    newAcc.setCurrentBalance(newAcc.getCurrentBalance().add(income.getAmount()));
                    accountRepo.save(newAcc);
                }
            }
        } else {
            income.setPaymentAccount(null);
        }

        Income updated = incomeRepo.save(income);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deleteIncome(Long id) {
        Income income = incomeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        // Deduct from account balance
        if (income.getPaymentAccount() != null && income.getAmount() != null) {
            PaymentAccount acc = income.getPaymentAccount();
            acc.setCurrentBalance(acc.getCurrentBalance().subtract(income.getAmount()));
            accountRepo.save(acc);
        }

        incomeRepo.delete(income);
    }

    @Override
    public BigDecimal getTotalIncomeByMonthAndYear(String month, int year) {
        BigDecimal total = incomeRepo.getTotalIncomeByMonthAndYear(month, year);
        return total != null ? total : BigDecimal.ZERO;
    }
}
