package com.kosa.fillinv.lesson.controller.dto;

import com.kosa.fillinv.lesson.service.dto.EditLessonCommand;

import java.time.Instant;

public record EditLessonRequest(
        String title,
        String description,
        String location,
        Long categoryId,
        Instant closeAt
) {
    public EditLessonCommand toCommand() {
        return new EditLessonCommand(
                this.title,
                this.description,
                this.location,
                this.categoryId,
                this.closeAt);
    }
}
