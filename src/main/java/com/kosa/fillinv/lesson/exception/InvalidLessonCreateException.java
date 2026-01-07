package com.kosa.fillinv.lesson.exception;

public class InvalidLessonCreateException extends RuntimeException {
    public InvalidLessonCreateException(String message) {
        super(message);
    }

    public InvalidLessonCreateException(LessonError error) {
        this(error.name());
    }
}
