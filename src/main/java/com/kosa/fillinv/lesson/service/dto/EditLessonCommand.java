package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.global.util.UploadFileResult;

import java.time.Instant;

public record EditLessonCommand(
        String title,
        String description,
        String location,
        Long categoryId,
        Instant closeAt
) {
    public UpdateLessonCommand toUpdateLessonCommand(UploadFileResult upload) {
        return new UpdateLessonCommand(
                this.title,
                upload != null ? upload.fileKey() : null,
                this.description,
                this.location,
                this.categoryId,
                this.closeAt
        );
    }
}
