package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.LocalDateTime;
import java.util.List;

public record CreateLessonResult(
        String id,
        LessonType lessonType,
        String thumbnailImage,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        LocalDateTime createdAt,
        LocalDateTime closeAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt,
        List<CreateOptionResult> optionResultList,
        List<AvailableTimeDTO> availableTimeDTOList

) {
    public static CreateLessonResult of(Lesson lesson) {
        return new CreateLessonResult(
                lesson.getId(),
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
                lesson.getOptionList().stream().map(CreateOptionResult::of).toList(),
                lesson.getAvailableTimeList().stream().map(AvailableTimeDTO::of).toList()
        );
    }
}
