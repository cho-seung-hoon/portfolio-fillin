package com.kosa.fillinv.schedule.dto.response;

import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import java.time.Instant;

public record ScheduleDetailResponse( // 스케쥴 상세 조회 (생성)
        String scheduleId,
        String lessonTitle,
        String category,
        String mentorNickname,
        String menteeNickname,
        Instant startTime,
        Instant endTime,
        String location,
        String description,
        String lessonType,
        String requestContent,
        ScheduleStatus status,
        Integer price,
        String optionName
) {
    public static ScheduleDetailResponse from(Schedule s, String mentorNickname, String menteeNickname,
            Instant startTime, Instant endTime) {
        return new ScheduleDetailResponse(
                s.getId(),
                s.getLessonTitle(),
                s.getLessonCategoryName(),
                mentorNickname,
                menteeNickname,
                startTime,
                endTime,
                s.getLessonLocation(),
                s.getLessonDescription(),
                s.getLessonType(),
                s.getRequestContent(),
                s.getStatus(),
                s.getPrice(),
                s.getOptionName()
        );
    }

}

