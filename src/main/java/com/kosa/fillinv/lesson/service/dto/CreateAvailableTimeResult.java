package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record CreateAvailableTimeResult(
        String id,
        String lessonId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Integer price,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
    public static CreateAvailableTimeResult of(AvailableTime availableTime) {
        return new CreateAvailableTimeResult(
                availableTime.getId(),
                availableTime.getLesson().getId(),
                availableTime.getDate(),
                availableTime.getStartTime(),
                availableTime.getEndTime(),
                availableTime.getPrice(),
                availableTime.getCreatedAt(),
                availableTime.getUpdatedAt(),
                availableTime.getDeletedAt()
        );
    }
}
