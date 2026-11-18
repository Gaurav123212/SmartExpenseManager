package com.Sehrawat.SmartExpenseTracker.CategoryModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Category;
import com.Sehrawat.SmartExpenseTracker.Entity.CategoryType;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepo categoryRepo;

    private CategoryDto toDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .categoryDescription(category.getCategoryDescription())
                .categoryType(category.getCategoryType() != null ? category.getCategoryType() : CategoryType.EXPENSE)
                .colorCode(category.getColorCode() != null ? category.getColorCode() : "#6366f1")
                .icon(category.getIcon() != null ? category.getIcon() : "fa-tag")
                .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null ? category.getParentCategory().getCategoryName() : null)
                .subCategoriesCount(category.getSubCategories() != null ? category.getSubCategories().size() : 0)
                .build();
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        List<Category> categoryEntities = categoryRepo.findAll();
        return categoryEntities.stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category Not Found"));
        return toDto(category);
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        if (categoryRepo.existsByCategoryName(categoryDto.getCategoryName())) {
            throw new RuntimeException("Category already exists");
        }
        Category category = Category.builder()
                .categoryName(categoryDto.getCategoryName())
                .categoryDescription(categoryDto.getCategoryDescription())
                .categoryType(categoryDto.getCategoryType() != null ? categoryDto.getCategoryType() : CategoryType.EXPENSE)
                .colorCode(categoryDto.getColorCode() != null ? categoryDto.getColorCode() : "#6366f1")
                .icon(categoryDto.getIcon() != null ? categoryDto.getIcon() : "fa-tag")
                .build();

        if (categoryDto.getParentCategoryId() != null) {
            Category parent = categoryRepo.findById(categoryDto.getParentCategoryId())
                    .orElse(null);
            category.setParentCategory(parent);
        }

        Category savedCategory = categoryRepo.save(category);
        return toDto(savedCategory);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category Not Found"));

        category.setCategoryName(categoryDto.getCategoryName());
        category.setCategoryDescription(categoryDto.getCategoryDescription());
        if (categoryDto.getCategoryType() != null) {
            category.setCategoryType(categoryDto.getCategoryType());
        }
        if (categoryDto.getColorCode() != null) {
            category.setColorCode(categoryDto.getColorCode());
        }
        if (categoryDto.getIcon() != null) {
            category.setIcon(categoryDto.getIcon());
        }
        if (categoryDto.getParentCategoryId() != null) {
            if (!categoryDto.getParentCategoryId().equals(category.getId())) {
                Category parent = categoryRepo.findById(categoryDto.getParentCategoryId()).orElse(null);
                category.setParentCategory(parent);
            }
        } else {
            category.setParentCategory(null);
        }

        Category updatedCategory = categoryRepo.save(category);
        return toDto(updatedCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category Not Found"));
        categoryRepo.delete(category);
    }

    @Override
    public CategoryDto getCategoryByName(String name) {
        Category category = categoryRepo.findByCategoryName(name).orElseThrow(() -> new RuntimeException("Category Not Found"));
        return toDto(category);
    }
}
