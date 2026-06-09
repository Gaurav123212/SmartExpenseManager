package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Budget;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepo budgetRepo;
    private final ModelMapper modelMapper;

    @Override
    public BudgetDto createBudget(BudgetDto budgetDto) {
        Budget budget = modelMapper.map(budgetDto, Budget.class);
        Budget savedBudget = budgetRepo.save(budget);
        return modelMapper.map(savedBudget, BudgetDto.class);
    }

    @Override
    public List<BudgetDto> getAllBudgets() {

        List<Budget> budgets = budgetRepo.findAll();

        return budgets.stream()
                .map(budget -> modelMapper.map(budget, BudgetDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDto getBudgetById(Long id) {

        Budget budget = budgetRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        return modelMapper.map(budget, BudgetDto.class);
    }

//    @Override
//    public List<BudgetDto> getBudgetsByMonthAndYear(String month, int year) {
//
//        List<Budget> budgets =
//                budgetRepo.findByMonthAndYear(month, year);
//
//        return budgets.stream()
//                .map(budget -> modelMapper.map(budget, BudgetDto.class))
//                .collect(Collectors.toList());
//    }

    @Override
    public List<BudgetDto> getBudgetByMonth(String month) {

        List<Budget> budgets =
                budgetRepo.findByMonth(month);

        return budgets.stream()
                .map(budget -> modelMapper.map(budget, BudgetDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDto updateBudget(BudgetDto budgetDto) {

        Budget budget = budgetRepo.findById(budgetDto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        budget.setMonthlyLimit(budgetDto.getMonthlyLimit());
        budget.setMonth(budgetDto.getMonth());
        budget.setYear(budgetDto.getYear());

        Budget updatedBudget = budgetRepo.save(budget);

        return modelMapper.map(updatedBudget, BudgetDto.class);
    }

    @Override
    public void deleteBudgetById(Long id) {

        Budget budget = budgetRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        budgetRepo.delete(budget);
    }
}