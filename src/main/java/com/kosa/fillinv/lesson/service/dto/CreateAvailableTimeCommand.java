package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Lesson;

import java.time.Instant;
import java.time.ZonedDateTime;

public record CreateAvailableTimeCommand(
        Instant startTime,
        Instant endTime,
        Integer price
) {
}
