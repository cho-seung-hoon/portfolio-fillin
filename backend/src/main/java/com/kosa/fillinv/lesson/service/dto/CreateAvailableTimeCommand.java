package com.kosa.fillinv.lesson.service.dto;

import java.time.Instant;

public record CreateAvailableTimeCommand(
        Instant startTime,
        Instant endTime,
        Integer price,
        Integer seats
) {
}
