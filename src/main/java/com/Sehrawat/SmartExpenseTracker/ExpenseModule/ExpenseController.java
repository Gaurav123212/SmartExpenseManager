package com.Sehrawat.SmartExpenseTracker.ExpenseModule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getAllExpenses() {
        return ResponseEntity.ok().body(expenseService.getAllExpenses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDto> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok().body(expenseService.getExpenseById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<ExpenseDto>> getExpenseByName(@PathVariable String name) {
        return ResponseEntity.ok().body(expenseService.getExpenseByName(name));
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@RequestBody ExpenseDto expenseDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(expenseDto));
    }

    @PutMapping("{id}")
    public ResponseEntity<ExpenseDto> updateExpense(@RequestBody ExpenseDto expenseDto, @PathVariable Long id) {
        return ResponseEntity.ok().body(expenseService.updateExpense(id, expenseDto));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ExpenseDto> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpenseById(id);
        return ResponseEntity.noContent().build();
    }

}