package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;

import java.time.Instant;

public record LessonThumbnail(
        String lessonId,
        String thumbnailImage,
        String lessonTitle,
        String lessonType,
        String mentorNickName,
        Float rating,
        Long categoryId,
        String category,
        Instant createdAt,
        Integer menteeCount,
        Double popularityScore,
        Integer price
) {
    public static LessonThumbnail of(
            LessonDTO lesson,
            MentorSummaryDTO mentor,
            Float rating,
            String category,
            Integer menteeCount
    ) {
        return new LessonThumbnail(
                lesson.id(),
                lesson.thumbnailImage(),
                lesson.title(),
                lesson.lessonType().name(),
                mentor.nickname(),
                rating,
                lesson.categoryId(),
                category,
                lesson.createdAt(),
                menteeCount,
                lesson.popularityScore(),
                lesson.price()
        );
    }
}
