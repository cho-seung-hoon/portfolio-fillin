package com.kosa.fillinv.lesson.service.dto;

import org.springframework.data.domain.Sort;

import java.util.Arrays;

public enum LessonSortType {
    CREATED_AT_ASC("createdAt", Sort.Direction.ASC),
    CREATED_AT_DESC("createdAt", Sort.Direction.DESC),

    PRICE_ASC("price", Sort.Direction.ASC),
    PRICE_DESC("price", Sort.Direction.DESC);

    private final String property;
    private final Sort.Direction direction;

    LessonSortType(String property, Sort.Direction direction) {
        this.property = property;
        this.direction = direction;
    }

    public static LessonSortType from(String value) {
        return Arrays.stream(values())
                .filter(type -> type.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("지원하지 않는 정렬 타입입니다: " + value)
                );
    }

    public Sort toSort() {
        return Sort.by(direction, property);
    }
}
