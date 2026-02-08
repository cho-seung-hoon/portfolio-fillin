package com.kosa.fillinv.category.dto;

import com.kosa.fillinv.category.entity.Category;

public record CategoryResponseDto(
        Long categoryId,
        String name,
        Long parentId,
        String categoryPath
) {
    public static CategoryResponseDto of(Category category) {
        return new CategoryResponseDto(
                category.getId(),
                category.getName(),
                category.getParentCategory() != null ? category.getParentCategory().getId() : null,
                category.getCategoryPath()
        );
    }
}
