package com.kosa.fillinv.lesson.controller.dto;

import com.kosa.fillinv.lesson.service.dto.UpdateLessonResult;

public record EditLessonResponse(
        String lessonId
) {
    public static EditLessonResponse of(UpdateLessonResult updateLessonResult) {
        return new EditLessonResponse(updateLessonResult.id());
    }
}
