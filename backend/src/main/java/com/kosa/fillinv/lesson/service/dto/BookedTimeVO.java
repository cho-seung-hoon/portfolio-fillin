package com.kosa.fillinv.lesson.service.dto;

import java.time.Instant;

public record BookedTimeVO(
        Instant startTime,
        Instant endTime
) {
}
