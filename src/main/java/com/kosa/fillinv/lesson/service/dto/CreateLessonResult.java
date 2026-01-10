package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.Instant;
import java.util.List;

public record CreateLessonResult(
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
        Integer price,
        Instant updatedAt,
        Instant deletedAt,
        List<CreateOptionResult> optionResultList,
        List<AvailableTimeDTO> availableTimeDTOList

) {
    public static CreateLessonResult of(Lesson lesson) {
        return new CreateLessonResult(
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
                lesson.getPrice(),
                lesson.getUpdatedAt(),
                lesson.getDeletedAt(),
                lesson.getOptionList().stream().map(CreateOptionResult::of).toList(),
                lesson.getAvailableTimeList().stream().map(AvailableTimeDTO::of).toList()
        );
    }
}
