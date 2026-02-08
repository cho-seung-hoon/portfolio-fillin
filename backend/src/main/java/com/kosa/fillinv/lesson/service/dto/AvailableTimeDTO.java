package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.AvailableTime;

import java.time.Instant;

public record AvailableTimeDTO(
        String id,
        String lessonId,
        Instant startTime,
        Instant endTime,
        Integer price,
        Integer seats,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
    public static AvailableTimeDTO of(AvailableTime availableTime) {
        return new AvailableTimeDTO(
                availableTime.getId(),
                availableTime.getLesson().getId(),
                availableTime.getStartTime(),
                availableTime.getEndTime(),
                availableTime.getPrice(),
                availableTime.getSeats(),
                availableTime.getCreatedAt(),
                availableTime.getUpdatedAt(),
                availableTime.getDeletedAt()
        );
    }
}
