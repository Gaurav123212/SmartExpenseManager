package com.Sehrawat.SmartExpenseTracker.TagModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepo extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);
    boolean existsByName(String name);
}
