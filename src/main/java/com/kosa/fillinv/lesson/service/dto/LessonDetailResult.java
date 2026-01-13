package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;

import java.time.Instant;
import java.util.List;

public record LessonDetailResult(
        Mentor mentor,
        Lesson lesson,
        List<Option> options,
        List<AvailableTime> availableTimes
) {
    public static LessonDetailResult of(MentorSummaryDTO mentorSummaryDTO, LessonDTO lessonDTO) {
        return new LessonDetailResult(
                Mentor.of(mentorSummaryDTO),
                Lesson.of(lessonDTO),
                lessonDTO.optionDTOList().stream().map(Option::of).toList(),
                lessonDTO.availableTimeDTOList().stream().map(AvailableTime::of).toList()
        );
    }

    public record Mentor(
            String mentorId,
            String nickname,
            String profileImage,
            String introduction
    ) {
        public static Mentor of(MentorSummaryDTO mentorSummaryDTO) {
            return new Mentor(
                    mentorSummaryDTO.mentorId(),
                    mentorSummaryDTO.nickname(),
                    mentorSummaryDTO.profileImage(),
                    mentorSummaryDTO.introduction()
            );
        }
    }

    public record Lesson(
            String lessonId,
            String description,
            String lessonType,
            String title,
            String thumbnailImage,
            Integer price,
            Long categoryId
    ) {
        public static Lesson of(LessonDTO lessonDTO) {
            return new Lesson(
                    lessonDTO.id(),
                    lessonDTO.description(),
                    lessonDTO.lessonType().name(),
                    lessonDTO.title(),
                    lessonDTO.thumbnailImage(),
                    lessonDTO.price(),
                    lessonDTO.categoryId()
            );
        }
    }

    public record Option(
            String optionId,
            String name,
            Integer minute,
            Integer price
    ) {

        public static Option of(OptionDTO optionDTOS) {
            return new Option(
                    optionDTOS.id(),
                    optionDTOS.name(),
                    optionDTOS.minute(),
                    optionDTOS.price()
            );
        }
    }

    public record AvailableTime(
            String availableTimeId,
            Instant startTime,
            Instant endTime,
            Integer price
    ) {
        public static AvailableTime of(AvailableTimeDTO availableTimeDTO) {
            return new AvailableTime(
                    availableTimeDTO.id(),
                    availableTimeDTO.startTime(),
                    availableTimeDTO.endTime(),
                    availableTimeDTO.price()
            );
        }
    }
}
