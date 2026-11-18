package com.Sehrawat.SmartExpenseTracker.IncomeModule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeDto>> getAllIncomes() {
        return ResponseEntity.ok(incomeService.getAllIncomes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeDto> getIncomeById(@PathVariable Long id) {
        return ResponseEntity.ok(incomeService.getIncomeById(id));
    }

    @PostMapping
    public ResponseEntity<IncomeDto> createIncome(@RequestBody IncomeDto incomeDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incomeService.createIncome(incomeDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeDto> updateIncome(@PathVariable Long id, @RequestBody IncomeDto incomeDto) {
        return ResponseEntity.ok(incomeService.updateIncome(id, incomeDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalIncome(
            @RequestParam String month,
            @RequestParam int year) {
        return ResponseEntity.ok(incomeService.getTotalIncomeByMonthAndYear(month, year));
    }
}
