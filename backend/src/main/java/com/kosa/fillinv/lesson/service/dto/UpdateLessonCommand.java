package com.kosa.fillinv.lesson.service.dto;

import java.time.Instant;

public record UpdateLessonCommand(
        String title,
        String thumbnailImage,
        String description,
        String location,
        Long categoryId,
        String categoryPath,
        Instant closeAt
) {
}
