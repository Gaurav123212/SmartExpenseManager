package com.Sehrawat.SmartExpenseTracker.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings_goals")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String goalName;

    @Column(nullable = false)
    private BigDecimal targetAmount;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GoalPriority priority = GoalPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id")
    private PaymentAccount linkedAccount;

    private String color;

    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (currentAmount == null) {
            currentAmount = BigDecimal.ZERO;
        }
    }
}
