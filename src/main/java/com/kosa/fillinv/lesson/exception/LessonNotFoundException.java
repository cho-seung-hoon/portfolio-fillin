package com.kosa.fillinv.lesson.exception;

public class LessonNotFoundException extends RuntimeException {
    public LessonNotFoundException(String message) {
        super("레슨을 찾을 수 없습니다. " + message);
    }
}
