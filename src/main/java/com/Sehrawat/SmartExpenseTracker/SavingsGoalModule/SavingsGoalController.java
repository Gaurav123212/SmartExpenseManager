package com.Sehrawat.SmartExpenseTracker.SavingsGoalModule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<List<SavingsGoalDto>> getAllSavingsGoals() {
        return ResponseEntity.ok(savingsGoalService.getAllSavingsGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingsGoalDto> getSavingsGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(savingsGoalService.getSavingsGoalById(id));
    }

    @PostMapping
    public ResponseEntity<SavingsGoalDto> createSavingsGoal(@RequestBody SavingsGoalDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(savingsGoalService.createSavingsGoal(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalDto> updateSavingsGoal(@PathVariable Long id, @RequestBody SavingsGoalDto dto) {
        return ResponseEntity.ok(savingsGoalService.updateSavingsGoal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavingsGoal(@PathVariable Long id) {
        savingsGoalService.deleteSavingsGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<SavingsGoalDto> contributeToGoal(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(savingsGoalService.contributeToGoal(id, amount));
    }
}
