package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.AvailableTime;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AvailableTimeDTO(
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
    public static AvailableTimeDTO of(AvailableTime availableTime) {
        return new AvailableTimeDTO(
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
