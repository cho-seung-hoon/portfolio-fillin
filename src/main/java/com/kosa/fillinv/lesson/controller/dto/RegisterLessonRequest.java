package com.kosa.fillinv.lesson.controller.dto;

import com.kosa.fillinv.lesson.service.dto.RegisterLessonCommand;

import java.time.Instant;
import java.util.List;

public record RegisterLessonRequest(
        String title,
        String lessonType,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        Instant closeAt,
        Integer price,
        List<Option> optionList,
        List<AvailableTime> availableTimeList
) {

    public static RegisterLessonCommand toCommand(RegisterLessonRequest request) {
        return new RegisterLessonCommand(
                request.title,
                request.lessonType,
                request.description,
                request.location,
                request.mentorId,
                request.categoryId,
                request.closeAt,
                request.price,
                request.optionList.stream().map(Option::toCommand).toList(),
                request.availableTimeList.stream().map(AvailableTime::toCommand).toList()
        );
    }

    public record Option(String name, Integer minute, Integer price) {
        public static RegisterLessonCommand.Option toCommand(Option option) {
            return new RegisterLessonCommand.Option(option.name, option.minute, option.price);
        }
    }

    public record AvailableTime(Instant startTime, Instant endTime, Integer price) {
        public static RegisterLessonCommand.AvailableTime toCommand(AvailableTime availableTime) {
            return new RegisterLessonCommand.AvailableTime(availableTime.startTime, availableTime.endTime, availableTime.price);
        }
    }
}
