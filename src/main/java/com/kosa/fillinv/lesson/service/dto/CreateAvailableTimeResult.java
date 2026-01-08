package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;

import java.time.*;

public record CreateAvailableTimeResult(
        String id,
        String lessonId,
        Instant startTime,
        Instant endTime,
        Integer price,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    public static CreateAvailableTimeResult of(AvailableTime availableTime) {
        return new CreateAvailableTimeResult(
                availableTime.getId(),
                availableTime.getLesson().getId(),
                availableTime.getStartTime(),
                availableTime.getEndTime(),
                availableTime.getPrice(),
                availableTime.getCreatedAt(),
                availableTime.getUpdatedAt(),
                availableTime.getDeletedAt()
        );
    }
}
