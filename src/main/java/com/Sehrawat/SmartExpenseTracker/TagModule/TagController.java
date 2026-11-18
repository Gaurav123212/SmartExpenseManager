package com.Sehrawat.SmartExpenseTracker.TagModule;

import com.Sehrawat.SmartExpenseTracker.Entity.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepo tagRepo;

    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags() {
        List<TagDto> dtos = tagRepo.findAll().stream()
                .map(t -> TagDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .color(t.getColor() != null ? t.getColor() : "#38bdf8")
                        .description(t.getDescription())
                        .expenseCount(t.getExpenses() != null ? t.getExpenses().size() : 0)
                        .build())
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<TagDto> createTag(@RequestBody TagDto dto) {
        if (tagRepo.existsByName(dto.getName())) {
            Tag existing = tagRepo.findByName(dto.getName()).get();
            return ResponseEntity.ok(TagDto.builder()
                    .id(existing.getId())
                    .name(existing.getName())
                    .color(existing.getColor())
                    .description(existing.getDescription())
                    .build());
        }
        Tag tag = Tag.builder()
                .name(dto.getName().trim().replace(" ", "-"))
                .color(dto.getColor() != null ? dto.getColor() : "#38bdf8")
                .description(dto.getDescription())
                .build();
        Tag saved = tagRepo.save(tag);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                TagDto.builder()
                        .id(saved.getId())
                        .name(saved.getName())
                        .color(saved.getColor())
                        .description(saved.getDescription())
                        .expenseCount(0)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
