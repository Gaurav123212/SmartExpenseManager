package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import com.Sehrawat.SmartExpenseTracker.CategoryModule.CategoryRepo;
import com.Sehrawat.SmartExpenseTracker.Entity.Category;
import com.Sehrawat.SmartExpenseTracker.Entity.Expense;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepo expenseRepo;
    private final ModelMapper modelMapper;
    private final CategoryRepo categoryRepo;

    @Override
    public List<ExpenseDto> getAllExpenses() {
        List<Expense> appEntity = expenseRepo.findAll();
        return appEntity.stream()
                .map(entity -> modelMapper.map(entity, ExpenseDto.class))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public ExpenseDto getExpenseById(Long id) {
        Expense expense = expenseRepo.findById(id).orElseThrow(()-> new RuntimeException("Expense not found"));
        return  modelMapper.map(expense, ExpenseDto.class);
    }

    @Override
    public List<ExpenseDto> getExpenseByName(String name) {
        List<Expense> expenses = expenseRepo.findByName(name);
        return expenses.stream()
                .map(entity -> modelMapper.map(entity, ExpenseDto.class))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public ExpenseDto createExpense(ExpenseDto expenseDto) {
        Expense expense = modelMapper.map(expenseDto, Expense.class);
        Category category = categoryRepo.findById(expenseDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        expense.setCategory(category);
        Expense savedExpense = expenseRepo.save(expense);
        return modelMapper.map(savedExpense, ExpenseDto.class);
    }

    @Override
    public void deleteExpenseById(Long id) {
        Expense expense = expenseRepo.findById(id).orElseThrow(()-> new RuntimeException("Expense not found"));
        expenseRepo.delete(expense);
    }

    @Override
    public ExpenseDto updateExpense(Long id, ExpenseDto expenseDto) {
        Expense expense = expenseRepo.findById(id).orElseThrow(()-> new RuntimeException("Expense not found"));
        Category newcategory = categoryRepo.findById(expenseDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        expense.setDescription(expenseDto.getDescription());
        expense.setName(expenseDto.getName());
        expense.setExpenseDate(expenseDto.getExpenseDate());
        expense.setAmount(expenseDto.getAmount());
        expense.setCategory(newcategory);
        expenseRepo.save(expense);

        return modelMapper.map(expense, ExpenseDto.class);
    }
}