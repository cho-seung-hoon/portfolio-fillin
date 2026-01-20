package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.LessonType;

public record LessonSearchCondition(
        String keyword,
        LessonType lessonType,
        Long categoryId,
        String mentorId,
        LessonSortType sortType,
        Integer page,
        Integer size
) {

    public LessonSearchCondition {
        if (sortType == null) {
            sortType = LessonSortType.CREATED_AT_DESC;
        }
        if (page == null || page < 0) {
            page = 0;
        }
        if (size == null || size <= 0) {
            size = 10;
        }
    }

    public static LessonSearchCondition defaultCondition() {
        return new LessonSearchCondition(
                null, null, null, null, null, null, null
        );
    }

    public LessonSearchCondition ownBy(String mentorId) {
        return new LessonSearchCondition(
                this.keyword,
                this.lessonType,
                this.categoryId,
                mentorId,
                this.sortType,
                this.page,
                this.size
        );
    }
}
