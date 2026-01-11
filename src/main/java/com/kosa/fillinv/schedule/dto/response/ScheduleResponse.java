package com.kosa.fillinv.schedule.dto.response;

import com.kosa.fillinv.schedule.entity.ScheduleStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleResponse(
        String scheduleId,
        String lessonTitle,
        String category,
        // 멘토 이름
        // 멘티 이름
        LocalDate date,
        LocalTime startTime,
        String location,
        String description,
        String lessonType,
        String requestContent,
        ScheduleStatus status,
        Integer price
) {

}

