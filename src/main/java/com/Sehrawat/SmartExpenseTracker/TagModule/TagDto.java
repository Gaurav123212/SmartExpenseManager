package com.Sehrawat.SmartExpenseTracker.TagModule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TagDto {
    private Long id;
    private String name;
    private String color;
    private String description;
    private int expenseCount;
}
