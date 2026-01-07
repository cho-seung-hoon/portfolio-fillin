package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.LocalDateTime;

public record UpdateLessonResult(
        String id,
        String title,
        LessonType lessonType,
        String thumbnailImage,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        LocalDateTime createdAt,
        LocalDateTime closeAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {

    public static UpdateLessonResult of(Lesson lesson) {
        return new UpdateLessonResult(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getLessonType(),
                lesson.getThumbnailImage(),
                lesson.getDescription(),
                lesson.getLocation(),
                lesson.getMentorId(),
                lesson.getCategoryId(),
                lesson.getCreatedAt(),
                lesson.getCloseAt(),
                lesson.getUpdatedAt(),
                lesson.getDeletedAt());
    }
}
