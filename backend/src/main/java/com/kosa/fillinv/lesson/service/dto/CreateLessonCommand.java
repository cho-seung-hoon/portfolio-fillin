package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.Instant;
import java.util.List;

public record CreateLessonCommand(
        String title,
        LessonType lessonType,
        String thumbnailImage,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        String categoryPath,
        Instant closeAt,
        Integer price,
        Integer seats,
        List<CreateOptionCommand> optionCommandList,
        List<CreateAvailableTimeCommand> availableTimeCommandList
) {
}
