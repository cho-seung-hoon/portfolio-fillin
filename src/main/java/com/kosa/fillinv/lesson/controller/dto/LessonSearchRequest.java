package com.kosa.fillinv.lesson.controller.dto;

import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.service.dto.LessonSearchCondition;
import com.kosa.fillinv.lesson.service.dto.LessonSortType;

public record LessonSearchRequest(
        String keyword,
        LessonType lessonType,
        Long categoryId,
        String mentorId,
        LessonSortType sortType,
        Integer page,
        Integer size
) {

    public static LessonSearchRequest empty() {
        return new LessonSearchRequest(null, null, null, null, null, null, null);
    }

    public LessonSearchCondition toCondition(String categoryPath) {
        return new LessonSearchCondition(
                this.keyword,
                this.lessonType,
                categoryPath,
                this.mentorId,
                this.sortType,
                this.page,
                this.size
        );
    }
}
