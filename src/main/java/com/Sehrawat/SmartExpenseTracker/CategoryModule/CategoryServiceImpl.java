package com.Sehrawat.SmartExpenseTracker.CategoryModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Category;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepo categoryRepo;
    private final ModelMapper modelMapper;

    @Override
    public List<CategoryDto> getAllCategories() {
        List<Category> categoryEntities = categoryRepo.findAll();
        return categoryEntities.stream()
                .map(category -> modelMapper.map(category, CategoryDto.class))
                .toList();
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(()-> new RuntimeException("Category Not Found"));
        return modelMapper.map(category, CategoryDto.class);
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        if (categoryRepo.existsByCategoryName(categoryDto.getCategoryName())) {
            throw new RuntimeException("Category already exists");
        }
        Category category = modelMapper.map(categoryDto, Category.class);
        Category savedCategory = categoryRepo.save(category);
        return modelMapper.map(savedCategory, CategoryDto.class);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category Not Found"));

        category.setCategoryName(categoryDto.getCategoryName());
        category.setCategoryDescription(categoryDto.getCategoryDescription());

        Category updatedCategory = categoryRepo.save(category);

        return modelMapper.map(updatedCategory, CategoryDto.class);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(()-> new RuntimeException("Category Not Found"));
        categoryRepo.delete(category);
    }

    @Override
    public CategoryDto getCategoryByName(String name) {
        Category category = categoryRepo.findByCategoryName(name).orElseThrow(()-> new RuntimeException("Category Not Found"));
        return modelMapper.map(category, CategoryDto.class);
    }
}