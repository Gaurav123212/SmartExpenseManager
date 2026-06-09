package com.Sehrawat.SmartExpenseTracker.CategoryModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepo extends JpaRepository<Category, Long> {

    boolean existsByCategoryName(String name);
    Optional<Category> findByCategoryName(String name);

}