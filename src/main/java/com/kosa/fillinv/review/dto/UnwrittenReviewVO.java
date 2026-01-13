package com.kosa.fillinv.review.dto;

import java.time.Instant;

public record UnwrittenReviewVO(
        String scheduleId,
        String lessonName,
        String lessonId,
        String optionName,
        Instant reservationDate,
        String mentorNickname) {
}
