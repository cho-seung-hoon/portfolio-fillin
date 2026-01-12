package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;

public record LessonThumbnail(
        String lessonId,
        String thumbnailImage,
        String lessonTitle,
        String lessonType,
        String mentorNickName,
        Float rating,
        Long categoryId
) {
    public static LessonThumbnail of(LessonDTO lesson, MentorSummaryDTO mentor, Float rating) {
        return new LessonThumbnail(
                lesson.id(),
                lesson.thumbnailImage(),
                lesson.title(),
                lesson.lessonType().name(),
                mentor.nickname(),
                rating,
                lesson.categoryId()
        );
    }
}
