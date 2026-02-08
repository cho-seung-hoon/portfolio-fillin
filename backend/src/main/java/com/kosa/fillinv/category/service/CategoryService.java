package com.kosa.fillinv.category.service;

import com.kosa.fillinv.category.dto.CategoryResponseDto;
import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.exception.ResourceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponseDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(CategoryResponseDto::of)
                .collect(Collectors.toList());
    }

    public Map<Long, CategoryResponseDto> getAllCategoriesMap() {
        return categoryRepository.findAll().stream()
                .collect(Collectors.toMap(
                        Category::getId,
                        CategoryResponseDto::of
                ));
    }

    public Category getCategoryById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceException.NotFound("카테고리를 찾을 수 없습니다."));
    }
}
