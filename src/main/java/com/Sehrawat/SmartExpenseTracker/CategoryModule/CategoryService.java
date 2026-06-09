package com.Sehrawat.SmartExpenseTracker.CategoryModule;

import java.util.List;

public interface CategoryService {

    List<CategoryDto> getAllCategories();
    CategoryDto getCategoryById(Long id);
    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Long id, CategoryDto categoryDto);
    void deleteCategory(Long id);
    CategoryDto getCategoryByName(String name);

}