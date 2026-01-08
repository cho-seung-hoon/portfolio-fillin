package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Option;

import java.time.Instant;

public record CreateOptionResult(
        String id,
        String name,
        Integer minute,
        Integer price,
        String lessonId,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    public static CreateOptionResult of(Option option) {
        return new CreateOptionResult(
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
