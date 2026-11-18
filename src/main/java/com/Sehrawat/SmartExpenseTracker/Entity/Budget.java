package com.Sehrawat.SmartExpenseTracker.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "budget")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal monthlyLimit;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private int year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Builder.Default
    private Double warningThresholdPercent = 80.0;

    private String notes;

}
