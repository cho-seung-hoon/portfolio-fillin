package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;

public record LessonThumbnail(
        String lessonId,
        String thumbnailImage,
        String lessonTitle,
        String lessonType,
        String mentorNickName,
        Float rating,
        Long categoryId,
        Integer menteeCount
) {
    public static LessonThumbnail of(
            LessonDTO lesson,
            MentorSummaryDTO mentor,
            Float rating,
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
                menteeCount
        );
    }
}
