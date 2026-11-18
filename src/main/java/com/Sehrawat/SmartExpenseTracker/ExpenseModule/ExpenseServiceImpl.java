package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import com.Sehrawat.SmartExpenseTracker.AccountModule.AccountRepo;
import com.Sehrawat.SmartExpenseTracker.CategoryModule.CategoryRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.*;
import com.Sehrawat.SmartExpenseTracker.TagModule.TagRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepo expenseRepo;
    private final CategoryRepo categoryRepo;
    private final AccountRepo accountRepo;
    private final TagRepo tagRepo;

    private ExpenseDto toDto(Expense expense) {
        if (expense == null) return null;
        return ExpenseDto.builder()
                .id(expense.getId())
                .name(expense.getName())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .categoryId(expense.getCategory() != null ? expense.getCategory().getId() : null)
                .categoryName(expense.getCategory() != null ? expense.getCategory().getCategoryName() : "Uncategorized")
                .categoryColor(expense.getCategory() != null ? expense.getCategory().getColorCode() : "#6366f1")
                .categoryIcon(expense.getCategory() != null ? expense.getCategory().getIcon() : "fa-tag")
                .accountId(expense.getPaymentAccount() != null ? expense.getPaymentAccount().getId() : null)
                .accountName(expense.getPaymentAccount() != null ? expense.getPaymentAccount().getAccountName() : "None")
                .merchant(expense.getMerchant())
                .referenceNumber(expense.getReferenceNumber())
                .paymentMethod(expense.getPaymentMethod() != null ? expense.getPaymentMethod() : PaymentMethod.CREDIT_CARD)
                .paymentStatus(expense.getPaymentStatus() != null ? expense.getPaymentStatus() : PaymentStatus.COMPLETED)
                .isRecurring(expense.isRecurring())
                .tags(expense.getTags() != null ? expense.getTags().stream().map(Tag::getName).collect(Collectors.toList()) : List.of())
                .createdAt(expense.getCreatedAt())
                .build();
    }

    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames != null) {
            for (String rawName : tagNames) {
                if (rawName == null || rawName.trim().isEmpty()) continue;
                String tagName = rawName.trim().replace(" ", "-");
                Tag tag = tagRepo.findByName(tagName)
                        .orElseGet(() -> tagRepo.save(Tag.builder().name(tagName).color("#38bdf8").build()));
                tags.add(tag);
            }
        }
        return tags;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDto> getAllExpenses() {
        return expenseRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseDto getExpenseById(Long id) {
        Expense expense = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return toDto(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDto> getExpenseByName(String name) {
        return expenseRepo.findByName(name).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExpenseDto createExpense(ExpenseDto expenseDto) {
        boolean recurring = Boolean.TRUE.equals(expenseDto.getIsRecurring());
        Expense expense = Expense.builder()
                .name(expenseDto.getName())
                .amount(expenseDto.getAmount())
                .description(expenseDto.getDescription())
                .expenseDate(expenseDto.getExpenseDate() != null ? expenseDto.getExpenseDate() : LocalDate.now())
                .merchant(expenseDto.getMerchant())
                .referenceNumber(expenseDto.getReferenceNumber())
                .paymentMethod(expenseDto.getPaymentMethod() != null ? expenseDto.getPaymentMethod() : PaymentMethod.CREDIT_CARD)
                .paymentStatus(expenseDto.getPaymentStatus() != null ? expenseDto.getPaymentStatus() : PaymentStatus.COMPLETED)
                .isRecurring(recurring)
                .tags(resolveTags(expenseDto.getTags()))
                .build();

        if (expenseDto.getCategoryId() != null) {
            Category category = categoryRepo.findById(expenseDto.getCategoryId()).orElse(null);
            expense.setCategory(category);
        }

        if (expenseDto.getAccountId() != null) {
            PaymentAccount account = accountRepo.findById(expenseDto.getAccountId()).orElse(null);
            if (account != null) {
                expense.setPaymentAccount(account);
                if (expense.getAmount() != null) {
                    BigDecimal bal = account.getCurrentBalance() != null ? account.getCurrentBalance() : BigDecimal.ZERO;
                    account.setCurrentBalance(bal.subtract(expense.getAmount()));
                    accountRepo.save(account);
                }
            }
        }

        Expense savedExpense = expenseRepo.save(expense);
        return toDto(savedExpense);
    }

    @Override
    @Transactional
    public void deleteExpenseById(Long id) {
        Expense expense = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getPaymentAccount() != null && expense.getAmount() != null) {
            PaymentAccount account = expense.getPaymentAccount();
            BigDecimal bal = account.getCurrentBalance() != null ? account.getCurrentBalance() : BigDecimal.ZERO;
            account.setCurrentBalance(bal.add(expense.getAmount()));
            accountRepo.save(account);
        }

        expenseRepo.delete(expense);
    }

    @Override
    @Transactional
    public ExpenseDto updateExpense(Long id, ExpenseDto expenseDto) {
        Expense expense = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getPaymentAccount() != null && expense.getAmount() != null) {
            PaymentAccount oldAcc = expense.getPaymentAccount();
            BigDecimal oldBal = oldAcc.getCurrentBalance() != null ? oldAcc.getCurrentBalance() : BigDecimal.ZERO;
            oldAcc.setCurrentBalance(oldBal.add(expense.getAmount()));
            accountRepo.save(oldAcc);
        }

        expense.setName(expenseDto.getName());
        expense.setDescription(expenseDto.getDescription());
        expense.setAmount(expenseDto.getAmount());
        if (expenseDto.getExpenseDate() != null) {
            expense.setExpenseDate(expenseDto.getExpenseDate());
        }
        expense.setMerchant(expenseDto.getMerchant());
        expense.setReferenceNumber(expenseDto.getReferenceNumber());
        if (expenseDto.getPaymentMethod() != null) {
            expense.setPaymentMethod(expenseDto.getPaymentMethod());
        }
        if (expenseDto.getPaymentStatus() != null) {
            expense.setPaymentStatus(expenseDto.getPaymentStatus());
        }
        if (expenseDto.getIsRecurring() != null) {
            expense.setRecurring(expenseDto.getIsRecurring());
        }
        expense.setTags(resolveTags(expenseDto.getTags()));

        if (expenseDto.getCategoryId() != null) {
            Category category = categoryRepo.findById(expenseDto.getCategoryId()).orElse(null);
            expense.setCategory(category);
        } else {
            expense.setCategory(null);
        }

        if (expenseDto.getAccountId() != null) {
            PaymentAccount newAcc = accountRepo.findById(expenseDto.getAccountId()).orElse(null);
            if (newAcc != null) {
                expense.setPaymentAccount(newAcc);
                if (expense.getAmount() != null) {
                    BigDecimal newBal = newAcc.getCurrentBalance() != null ? newAcc.getCurrentBalance() : BigDecimal.ZERO;
                    newAcc.setCurrentBalance(newBal.subtract(expense.getAmount()));
                    accountRepo.save(newAcc);
                }
            }
        } else {
            expense.setPaymentAccount(null);
        }

        Expense updated = expenseRepo.save(expense);
        return toDto(updated);
    }
}
