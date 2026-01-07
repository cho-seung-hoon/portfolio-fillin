package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.LocalDateTime;

public record UpdateLessonCommand(
        String title,
        String thumbnailImage,
        String description,
        String location,
        Long categoryId,
        LocalDateTime closeAt
) {
}
