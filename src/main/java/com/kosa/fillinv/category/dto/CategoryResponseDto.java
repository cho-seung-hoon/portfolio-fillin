package com.kosa.fillinv.category.dto;

import lombok.Builder;

@Builder
public record CategoryResponseDto(
        Long categoryId,
        String name) {
}
