package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.LocalDateTime;
import java.util.List;

public record CreateLessonCommand(
        LessonType lessonType,
        String thumbnailImage,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        LocalDateTime closeAt,
        List<CreateOptionCommand> optionCommandList,
        List<CreateAvailableTimeCommand> availableTimeCommandList
) {
}
