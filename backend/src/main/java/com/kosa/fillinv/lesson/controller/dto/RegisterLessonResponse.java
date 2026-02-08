package com.kosa.fillinv.lesson.controller.dto;

import com.kosa.fillinv.lesson.service.dto.CreateLessonResult;

public record RegisterLessonResponse(
        String lessonId
) {
    public static RegisterLessonResponse of(CreateLessonResult result) {
        return new RegisterLessonResponse(
                result.id()
        );
    }
}
