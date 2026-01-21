package com.kosa.fillinv.lesson.service.dto;


import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.Instant;
import java.util.List;

public record RegisterLessonCommand(
        String title,
        String lessonType,
        String description,
        String location,
        String mentorId,
        Long categoryId,
        Instant closeAt,
        Integer price,
        Integer seats,
        List<Option> optionList,
        List<AvailableTime> availableTimeList
) {

    public CreateLessonCommand toCreateLessonCommand(String categoryPath, String thumbnailImage) {
        return new CreateLessonCommand(
                this.title,
                LessonType.from(this.lessonType),
                thumbnailImage,
                this.description,
                this.location,
                this.mentorId,
                this.categoryId,
                categoryPath,
                this.closeAt,
                this.price,
                this.seats,
                optionList.stream().map(op -> new CreateOptionCommand(op.name(), op.minute(), op.price())).toList(),
                availableTimeList.stream().map(at -> new CreateAvailableTimeCommand(at.startTime(), at.endTime(), at.price(), at.seats())).toList()
        );
    }

    public record Option(String name, Integer minute, Integer price) {
    }

    public record AvailableTime(Instant startTime, Instant endTime, Integer price, Integer seats) {
    }
}
