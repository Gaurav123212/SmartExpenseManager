package com.Sehrawat.SmartExpenseTracker.BudgetModule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDto> createBudget(@RequestBody BudgetDto budgetDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(budgetDto));
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getAllBudgets() {
        return ResponseEntity.ok(budgetService.getAllBudgets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDto> getBudgetById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetById(id));
    }

    @GetMapping("/month/{month}")
    public ResponseEntity<List<BudgetDto>> getBudgetByMonth(
            @PathVariable String month) {

        return ResponseEntity.ok(
                budgetService.getBudgetByMonth(month)
        );
    }

//    @GetMapping("/search")
//    public ResponseEntity<List<BudgetDto>> getBudgetsByMonthAndYear(
//            @RequestParam String month,
//            @RequestParam int year) {
//
//        return ResponseEntity.ok(
//                budgetService.getBudgetsByMonthAndYear(month, year)
//        );
//    }

    @PutMapping
    public ResponseEntity<BudgetDto> updateBudget(
            @RequestBody BudgetDto budgetDto) {

        return ResponseEntity.ok(
                budgetService.updateBudget(budgetDto)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudgetById(
            @PathVariable Long id) {

        budgetService.deleteBudgetById(id);

        return ResponseEntity.ok("Budget deleted successfully");
    }
}