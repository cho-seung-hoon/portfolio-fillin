package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record LessonDetailResult(
        Mentor mentor,
        Lesson lesson,
        List<Option> options,
        List<AvailableTime> availableTimes
) {
    public static LessonDetailResult of(
            MentorSummaryDTO mentorSummaryDTO,
            LessonDTO lessonDTO,
            Integer lessonRemainSeats,
            Map<String, Integer> availableTimeRemainSeats,
            String categoryName,
            Integer menteeCount
    ) {
        return new LessonDetailResult(
                Mentor.of(mentorSummaryDTO),
                Lesson.of(lessonDTO, lessonRemainSeats, categoryName, menteeCount),
                lessonDTO.optionDTOList().stream().map(Option::of).toList(),
                lessonDTO.availableTimeDTOList().stream()
                        .map(dt -> AvailableTime.of(dt, availableTimeRemainSeats != null ? availableTimeRemainSeats.get(dt.id()) : null))
                        .toList());
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
            Integer seats,
            Integer remainSeats,
            Long categoryId,
            String location,
            Instant closeAt,
            String category,
            Integer menteeCount
    ) {
        public static Lesson of(LessonDTO lessonDTO, Integer remainSeats, String categoryName, Integer menteeCount) {
            return new Lesson(
                    lessonDTO.id(),
                    lessonDTO.description(),
                    lessonDTO.lessonType().name(),
                    lessonDTO.title(),
                    lessonDTO.thumbnailImage(),
                    lessonDTO.price(),
                    lessonDTO.seats(),
                    remainSeats,
                    lessonDTO.categoryId(),
                    lessonDTO.location(),
                    lessonDTO.closeAt(),
                    categoryName,
                    menteeCount
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
                    optionDTOS.price());
        }
    }

    public record AvailableTime(
            String availableTimeId,
            Instant startTime,
            Instant endTime,
            Integer price,
            Integer seats,
            Integer remainSeats
    ) {
        public static AvailableTime of(AvailableTimeDTO availableTimeDTO, Integer remainSeats) {
            return new AvailableTime(
                    availableTimeDTO.id(),
                    availableTimeDTO.startTime(),
                    availableTimeDTO.endTime(),
                    availableTimeDTO.price(),
                    availableTimeDTO.seats(),
                    remainSeats);
        }
    }
}
