package com.Sehrawat.SmartExpenseTracker.CategoryModule;

import com.Sehrawat.SmartExpenseTracker.Entity.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {

    private Long id;
    private String categoryName;
    private String categoryDescription;
    private CategoryType categoryType;
    private String colorCode;
    private String icon;
    private Long parentCategoryId;
    private String parentCategoryName;
    private Integer subCategoriesCount;

}
