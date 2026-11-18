package com.Sehrawat.SmartExpenseTracker.RecurringModule;

import com.Sehrawat.SmartExpenseTracker.AccountModule.AccountRepo;
import com.Sehrawat.SmartExpenseTracker.CategoryModule.CategoryRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.*;
import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseDto;
import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringExpenseServiceImpl implements RecurringExpenseService {

    private final RecurringExpenseRepo recurringExpenseRepo;
    private final CategoryRepo categoryRepo;
    private final AccountRepo accountRepo;
    private final ExpenseService expenseService;

    private RecurringExpenseDto toDto(RecurringExpense r) {
        if (r == null) return null;
        long daysUntilDue = 0;
        if (r.getNextDueDate() != null) {
            daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), r.getNextDueDate());
        }
        return RecurringExpenseDto.builder()
                .id(r.getId())
                .title(r.getTitle())
                .amount(r.getAmount())
                .frequency(r.getFrequency() != null ? r.getFrequency() : RecurrenceFrequency.MONTHLY)
                .startDate(r.getStartDate())
                .nextDueDate(r.getNextDueDate())
                .categoryId(r.getCategory() != null ? r.getCategory().getId() : null)
                .categoryName(r.getCategory() != null ? r.getCategory().getCategoryName() : "General")
                .categoryColor(r.getCategory() != null ? r.getCategory().getColorCode() : "#6366f1")
                .accountId(r.getPaymentAccount() != null ? r.getPaymentAccount().getId() : null)
                .accountName(r.getPaymentAccount() != null ? r.getPaymentAccount().getAccountName() : "None")
                .autoPay(r.isAutoPay())
                .status(r.getStatus() != null ? r.getStatus() : SubscriptionStatus.ACTIVE)
                .reminderDaysBefore(r.getReminderDaysBefore())
                .notes(r.getNotes())
                .daysUntilDue(daysUntilDue)
                .createdAt(r.getCreatedAt())
                .build();
    }

    @Override
    public List<RecurringExpenseDto> getAllRecurringExpenses() {
        return recurringExpenseRepo.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public RecurringExpenseDto getRecurringExpenseById(Long id) {
        RecurringExpense r = recurringExpenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring expense not found"));
        return toDto(r);
    }

    @Override
    public RecurringExpenseDto createRecurringExpense(RecurringExpenseDto dto) {
        RecurringExpense r = RecurringExpense.builder()
                .title(dto.getTitle())
                .amount(dto.getAmount())
                .frequency(dto.getFrequency() != null ? dto.getFrequency() : RecurrenceFrequency.MONTHLY)
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .nextDueDate(dto.getNextDueDate() != null ? dto.getNextDueDate() : LocalDate.now().plusMonths(1))
                .autoPay(Boolean.TRUE.equals(dto.getAutoPay()))
                .status(dto.getStatus() != null ? dto.getStatus() : SubscriptionStatus.ACTIVE)
                .reminderDaysBefore(dto.getReminderDaysBefore() > 0 ? dto.getReminderDaysBefore() : 3)
                .notes(dto.getNotes())
                .build();

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId()).orElse(null);
            r.setCategory(category);
        }

        if (dto.getAccountId() != null) {
            PaymentAccount account = accountRepo.findById(dto.getAccountId()).orElse(null);
            r.setPaymentAccount(account);
        }

        RecurringExpense saved = recurringExpenseRepo.save(r);
        return toDto(saved);
    }

    @Override
    public RecurringExpenseDto updateRecurringExpense(Long id, RecurringExpenseDto dto) {
        RecurringExpense r = recurringExpenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring expense not found"));

        r.setTitle(dto.getTitle());
        r.setAmount(dto.getAmount());
        if (dto.getFrequency() != null) {
            r.setFrequency(dto.getFrequency());
        }
        if (dto.getStartDate() != null) {
            r.setStartDate(dto.getStartDate());
        }
        if (dto.getNextDueDate() != null) {
            r.setNextDueDate(dto.getNextDueDate());
        }
        if (dto.getAutoPay() != null) {
            r.setAutoPay(dto.getAutoPay());
        }
        if (dto.getStatus() != null) {
            r.setStatus(dto.getStatus());
        }
        r.setReminderDaysBefore(dto.getReminderDaysBefore());
        r.setNotes(dto.getNotes());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepo.findById(dto.getCategoryId()).orElse(null);
            r.setCategory(category);
        } else {
            r.setCategory(null);
        }

        if (dto.getAccountId() != null) {
            PaymentAccount account = accountRepo.findById(dto.getAccountId()).orElse(null);
            r.setPaymentAccount(account);
        } else {
            r.setPaymentAccount(null);
        }

        RecurringExpense updated = recurringExpenseRepo.save(r);
        return toDto(updated);
    }

    @Override
    public void deleteRecurringExpense(Long id) {
        recurringExpenseRepo.deleteById(id);
    }

    @Override
    @Transactional
    public ExpenseDto processPayment(Long id) {
        RecurringExpense r = recurringExpenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring expense not found"));

        // Generate Expense
        ExpenseDto expenseDto = ExpenseDto.builder()
                .name(r.getTitle() + " (Recurring)")
                .amount(r.getAmount())
                .description("Auto-generated recurring payment for " + r.getTitle())
                .expenseDate(LocalDate.now())
                .categoryId(r.getCategory() != null ? r.getCategory().getId() : null)
                .accountId(r.getPaymentAccount() != null ? r.getPaymentAccount().getId() : null)
                .merchant(r.getTitle())
                .isRecurring(true)
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .paymentStatus(PaymentStatus.COMPLETED)
                .tags(List.of("Recurring", "Subscription"))
                .build();

        ExpenseDto createdExpense = expenseService.createExpense(expenseDto);

        // Advance next due date based on frequency
        LocalDate nextDate = r.getNextDueDate() != null ? r.getNextDueDate() : LocalDate.now();
        LocalDate advancedDate = switch (r.getFrequency() != null ? r.getFrequency() : RecurrenceFrequency.MONTHLY) {
            case DAILY -> nextDate.plusDays(1);
            case WEEKLY -> nextDate.plusWeeks(1);
            case MONTHLY -> nextDate.plusMonths(1);
            case QUARTERLY -> nextDate.plusMonths(3);
            case YEARLY -> nextDate.plusYears(1);
        };
        r.setNextDueDate(advancedDate);
        recurringExpenseRepo.save(r);

        return createdExpense;
    }

    @Override
    public BigDecimal getTotalActiveMonthlyCommitment() {
        return recurringExpenseRepo.getTotalActiveRecurringAmount();
    }
}
