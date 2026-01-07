package com.kosa.fillinv.lesson.service.dto;

import com.kosa.fillinv.lesson.entity.Lesson;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateAvailableTimeCommand(
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Integer price
) {
}
