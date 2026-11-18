package com.Sehrawat.SmartExpenseTracker.SavingsGoalModule;

import com.Sehrawat.SmartExpenseTracker.AccountModule.AccountRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.GoalPriority;
import com.Sehrawat.SmartExpenseTracker.Entity.GoalStatus;
import com.Sehrawat.SmartExpenseTracker.Entity.PaymentAccount;
import com.Sehrawat.SmartExpenseTracker.Entity.SavingsGoal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalServiceImpl implements SavingsGoalService {

    private final SavingsGoalRepo savingsGoalRepo;
    private final AccountRepo accountRepo;

    private SavingsGoalDto toDto(SavingsGoal g) {
        if (g == null) return null;
        BigDecimal target = g.getTargetAmount() != null ? g.getTargetAmount() : BigDecimal.ZERO;
        BigDecimal current = g.getCurrentAmount() != null ? g.getCurrentAmount() : BigDecimal.ZERO;
        BigDecimal remaining = target.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        double progress = 0.0;
        if (target.compareTo(BigDecimal.ZERO) > 0) {
            progress = current.multiply(BigDecimal.valueOf(100))
                    .divide(target, 2, RoundingMode.HALF_UP)
                    .doubleValue();
            if (progress > 100.0) progress = 100.0;
        }

        return SavingsGoalDto.builder()
                .id(g.getId())
                .goalName(g.getGoalName())
                .targetAmount(target)
                .currentAmount(current)
                .remainingAmount(remaining)
                .progressPercentage(progress)
                .targetDate(g.getTargetDate())
                .priority(g.getPriority() != null ? g.getPriority() : GoalPriority.MEDIUM)
                .status(g.getStatus() != null ? g.getStatus() : GoalStatus.IN_PROGRESS)
                .linkedAccountId(g.getLinkedAccount() != null ? g.getLinkedAccount().getId() : null)
                .linkedAccountName(g.getLinkedAccount() != null ? g.getLinkedAccount().getAccountName() : "None")
                .color(g.getColor() != null ? g.getColor() : "#10b981")
                .notes(g.getNotes())
                .createdAt(g.getCreatedAt())
                .build();
    }

    @Override
    public List<SavingsGoalDto> getAllSavingsGoals() {
        return savingsGoalRepo.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public SavingsGoalDto getSavingsGoalById(Long id) {
        SavingsGoal g = savingsGoalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        return toDto(g);
    }

    @Override
    public SavingsGoalDto createSavingsGoal(SavingsGoalDto dto) {
        SavingsGoal g = SavingsGoal.builder()
                .goalName(dto.getGoalName())
                .targetAmount(dto.getTargetAmount())
                .currentAmount(dto.getCurrentAmount() != null ? dto.getCurrentAmount() : BigDecimal.ZERO)
                .targetDate(dto.getTargetDate())
                .priority(dto.getPriority() != null ? dto.getPriority() : GoalPriority.MEDIUM)
                .status(dto.getStatus() != null ? dto.getStatus() : GoalStatus.IN_PROGRESS)
                .color(dto.getColor() != null ? dto.getColor() : "#10b981")
                .notes(dto.getNotes())
                .build();

        if (dto.getLinkedAccountId() != null) {
            PaymentAccount account = accountRepo.findById(dto.getLinkedAccountId()).orElse(null);
            g.setLinkedAccount(account);
        }

        SavingsGoal saved = savingsGoalRepo.save(g);
        return toDto(saved);
    }

    @Override
    public SavingsGoalDto updateSavingsGoal(Long id, SavingsGoalDto dto) {
        SavingsGoal g = savingsGoalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        g.setGoalName(dto.getGoalName());
        g.setTargetAmount(dto.getTargetAmount());
        if (dto.getCurrentAmount() != null) {
            g.setCurrentAmount(dto.getCurrentAmount());
        }
        g.setTargetDate(dto.getTargetDate());
        if (dto.getPriority() != null) {
            g.setPriority(dto.getPriority());
        }
        if (dto.getStatus() != null) {
            g.setStatus(dto.getStatus());
        }
        if (dto.getColor() != null) {
            g.setColor(dto.getColor());
        }
        g.setNotes(dto.getNotes());

        if (dto.getLinkedAccountId() != null) {
            PaymentAccount account = accountRepo.findById(dto.getLinkedAccountId()).orElse(null);
            g.setLinkedAccount(account);
        } else {
            g.setLinkedAccount(null);
        }

        // Auto update status if reached
        if (g.getCurrentAmount().compareTo(g.getTargetAmount()) >= 0) {
            g.setStatus(GoalStatus.ACHIEVED);
        }

        SavingsGoal updated = savingsGoalRepo.save(g);
        return toDto(updated);
    }

    @Override
    public void deleteSavingsGoal(Long id) {
        savingsGoalRepo.deleteById(id);
    }

    @Override
    @Transactional
    public SavingsGoalDto contributeToGoal(Long id, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution amount must be greater than zero");
        }

        SavingsGoal g = savingsGoalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        BigDecimal newAmount = g.getCurrentAmount().add(amount);
        g.setCurrentAmount(newAmount);

        if (newAmount.compareTo(g.getTargetAmount()) >= 0) {
            g.setStatus(GoalStatus.ACHIEVED);
        }

        // Deduct from linked account if available
        if (g.getLinkedAccount() != null) {
            PaymentAccount acc = g.getLinkedAccount();
            acc.setCurrentBalance(acc.getCurrentBalance().subtract(amount));
            accountRepo.save(acc);
        }

        SavingsGoal saved = savingsGoalRepo.save(g);
        return toDto(saved);
    }
}
