package com.Sehrawat.SmartExpenseTracker.RecurringModule;

import com.Sehrawat.SmartExpenseTracker.ExpenseModule.ExpenseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/recurring-expenses")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    @GetMapping
    public ResponseEntity<List<RecurringExpenseDto>> getAllRecurringExpenses() {
        return ResponseEntity.ok(recurringExpenseService.getAllRecurringExpenses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringExpenseDto> getRecurringExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(recurringExpenseService.getRecurringExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<RecurringExpenseDto> createRecurringExpense(@RequestBody RecurringExpenseDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recurringExpenseService.createRecurringExpense(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringExpenseDto> updateRecurringExpense(@PathVariable Long id, @RequestBody RecurringExpenseDto dto) {
        return ResponseEntity.ok(recurringExpenseService.updateRecurringExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringExpense(@PathVariable Long id) {
        recurringExpenseService.deleteRecurringExpense(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ExpenseDto> processPayment(@PathVariable Long id) {
        return ResponseEntity.ok(recurringExpenseService.processPayment(id));
    }

    @GetMapping("/monthly-commitment")
    public ResponseEntity<BigDecimal> getMonthlyCommitment() {
        return ResponseEntity.ok(recurringExpenseService.getTotalActiveMonthlyCommitment());
    }
}
