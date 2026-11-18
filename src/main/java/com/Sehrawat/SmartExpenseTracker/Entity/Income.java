package com.Sehrawat.SmartExpenseTracker.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "incomes")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private BigDecimal amount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate incomeDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id")
    private PaymentAccount paymentAccount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.BANK_TRANSFER;

    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (incomeDate == null) {
            incomeDate = LocalDate.now();
        }
    }
}
