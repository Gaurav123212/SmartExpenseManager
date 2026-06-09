package com.Sehrawat.SmartExpenseTracker.AnalyticsModule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/budget-status")
    public ResponseEntity<AnalyticsDto> getBudgetStatus(@RequestParam String month, @RequestParam int year) {
        return ResponseEntity.ok(analyticsService.getBudgetStatus(month, year));
    }

    @GetMapping("/monthly-report")
    public ResponseEntity<MonthlyReportDto> getMonthlyReport(@RequestParam String month, @RequestParam int year) {
        return ResponseEntity.ok(analyticsService.getMonthlyReport(month, year));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<SpendingTrendDto>> getSpendingTrend(@RequestParam int year) {
        return ResponseEntity.ok(analyticsService.getSpendingTrend(year));
    }

}