package com.kosa.fillinv.lesson.controller.dto;

import com.kosa.fillinv.lesson.service.dto.RegisterLessonCommand;

import java.time.Instant;
import java.util.List;

public record RegisterLessonRequest(
        String title,
        String lessonType,
        String description,
        String location,
        Long categoryId,
        Instant closeAt,
        Integer price,
        Integer seats,
        List<Option> optionList,
        List<AvailableTime> availableTimeList
) {

    public RegisterLessonCommand toCommand(String mentorId) {
        return new RegisterLessonCommand(
                this.title,
                this.lessonType,
                this.description,
                this.location,
                mentorId,
                this.categoryId,
                this.closeAt,
                this.price,
                this.seats,
                this.optionList.stream().map(Option::toCommand).toList(),
                this.availableTimeList.stream().map(AvailableTime::toCommand).toList()
        );
    }

    public record Option(String name, Integer minute, Integer price) {
        public static RegisterLessonCommand.Option toCommand(Option option) {
            return new RegisterLessonCommand.Option(option.name, option.minute, option.price);
        }
    }

    public record AvailableTime(Instant startTime, Instant endTime, Integer price, Integer seats) {
        public static RegisterLessonCommand.AvailableTime toCommand(AvailableTime availableTime) {
            return new RegisterLessonCommand.AvailableTime(availableTime.startTime, availableTime.endTime, availableTime.price, availableTime.seats);
        }
    }
}
