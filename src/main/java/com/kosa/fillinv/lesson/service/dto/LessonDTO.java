package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.Instant;
import java.util.List;

public record LessonDTO(
        String id,
        String title,
        LessonType lessonType,
        String thumbnailImage,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        Instant createdAt,
        Instant closeAt,
        Instant updatedAt,
        Instant deletedAt,
        List<AvailableTimeDTO> availableTimeDTOList,
        List<OptionDTO> optionDTOList
) {
    public static LessonDTO of(Lesson lesson) {
        return new LessonDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getLessonType(),
                lesson.getThumbnailImage(),
                lesson.getDescription(),
                lesson.getLocation(),
                lesson.getMentorId(),
                lesson.getCategoryId(),
                lesson.getCreatedAt(),
                lesson.getCloseAt(),
                lesson.getUpdatedAt(),
                lesson.getDeletedAt(),
                lesson.getAvailableTimeList().stream().map(AvailableTimeDTO::of).toList(),
                lesson.getOptionList().stream().map(OptionDTO::of).toList()
        );
    }
}
