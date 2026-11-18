package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import com.Sehrawat.SmartExpenseTracker.CategoryModule.CategoryRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.Budget;
import com.Sehrawat.SmartExpenseTracker.Entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepo budgetRepo;
    private final CategoryRepo categoryRepo;

    private BudgetDto toDto(Budget budget) {
        if (budget == null) return null;
        return BudgetDto.builder()
                .id(budget.getId())
                .monthlyLimit(budget.getMonthlyLimit())
                .month(budget.getMonth())
                .year(budget.getYear())
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getCategoryName() : "Overall Budget")
                .warningThresholdPercent(budget.getWarningThresholdPercent() != null ? budget.getWarningThresholdPercent() : 80.0)
                .notes(budget.getNotes())
                .build();
    }

    @Override
    public BudgetDto createBudget(BudgetDto budgetDto) {
        Budget budget = Budget.builder()
                .monthlyLimit(budgetDto.getMonthlyLimit())
                .month(budgetDto.getMonth())
                .year(budgetDto.getYear())
                .warningThresholdPercent(budgetDto.getWarningThresholdPercent() != null ? budgetDto.getWarningThresholdPercent() : 80.0)
                .notes(budgetDto.getNotes())
                .build();

        if (budgetDto.getCategoryId() != null) {
            Category category = categoryRepo.findById(budgetDto.getCategoryId()).orElse(null);
            budget.setCategory(category);
        }

        Budget savedBudget = budgetRepo.save(budget);
        return toDto(savedBudget);
    }

    @Override
    public List<BudgetDto> getAllBudgets() {
        List<Budget> budgets = budgetRepo.findAll();
        return budgets.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDto getBudgetById(Long id) {
        Budget budget = budgetRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        return toDto(budget);
    }

    @Override
    public List<BudgetDto> getBudgetByMonth(String month) {
        List<Budget> budgets = budgetRepo.findByMonth(month);
        return budgets.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDto updateBudget(BudgetDto budgetDto) {
        Budget budget = budgetRepo.findById(budgetDto.getId())
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        budget.setMonthlyLimit(budgetDto.getMonthlyLimit());
        budget.setMonth(budgetDto.getMonth());
        budget.setYear(budgetDto.getYear());
        if (budgetDto.getWarningThresholdPercent() != null) {
            budget.setWarningThresholdPercent(budgetDto.getWarningThresholdPercent());
        }
        budget.setNotes(budgetDto.getNotes());

        if (budgetDto.getCategoryId() != null) {
            Category category = categoryRepo.findById(budgetDto.getCategoryId()).orElse(null);
            budget.setCategory(category);
        } else {
            budget.setCategory(null);
        }

        Budget updatedBudget = budgetRepo.save(budget);
        return toDto(updatedBudget);
    }

    @Override
    public void deleteBudgetById(Long id) {
        Budget budget = budgetRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budgetRepo.delete(budget);
    }
}
