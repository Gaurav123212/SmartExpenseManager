package com.Sehrawat.SmartExpenseTracker.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_accounts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    private String institutionName;

    private String accountNumberMasked;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    private BigDecimal creditLimit;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private boolean active = true;

    private String color;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "paymentAccount")
    @JsonIgnore
    @Builder.Default
    private List<Expense> expenses = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
    }
}
