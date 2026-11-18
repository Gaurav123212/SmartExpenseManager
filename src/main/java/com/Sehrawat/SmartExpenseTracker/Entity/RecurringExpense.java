package com.Sehrawat.SmartExpenseTracker.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_expenses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecurringExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecurrenceFrequency frequency = RecurrenceFrequency.MONTHLY;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate nextDueDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id")
    private PaymentAccount paymentAccount;

    @Builder.Default
    private boolean autoPay = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Builder.Default
    private int reminderDaysBefore = 3;

    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (nextDueDate == null) {
            nextDueDate = LocalDate.now().plusMonths(1);
        }
    }
}
