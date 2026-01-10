package com.kosa.fillinv.lesson.entity;


import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.lesson.error.LessonError;

public enum LessonType {
    MENTORING,
    ONEDAY,
    STUDY,
    ;

    public static LessonType from(String value) {
        if (value == null || value.isBlank()) {
            throw new ResourceException.InvalidArgument(
                    LessonError.LESSON_TYPE_REQUIRED
            );
        }

        try {
            return LessonType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResourceException.InvalidArgument(LessonError.INVALID_LESSON_TYPE(value));
        }
    }
}
