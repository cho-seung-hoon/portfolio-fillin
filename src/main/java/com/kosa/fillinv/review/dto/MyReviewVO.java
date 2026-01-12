package com.kosa.fillinv.review.dto;

import com.kosa.fillinv.review.entity.Review;

import java.time.Instant;

public record MyReviewVO(
        Review review,
        String lessonName,
        String optionName,
        Instant reservationDate,
        String mentorNickname) {
}
