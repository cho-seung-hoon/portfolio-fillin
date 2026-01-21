package com.kosa.fillinv.review.dto;

public record ReviewStatsDTO(
        String lessonId,
        Long count,
        Double averageScore) {
}
