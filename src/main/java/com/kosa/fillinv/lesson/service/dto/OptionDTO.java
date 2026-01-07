package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Option;

import java.time.LocalDateTime;
import java.util.function.Function;

public record OptionDTO(
        String id,
        String name,
        Integer minute,
        Integer price,
        String lessonId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
    public static OptionDTO of(Option option) {
        return new OptionDTO(
                option.getId(),
                option.getName(),
                option.getMinute(),
                option.getPrice(),
                option.getLesson().getId(),
                option.getCreatedAt(),
                option.getUpdatedAt(),
                option.getDeletedAt()
        );
    }
}
