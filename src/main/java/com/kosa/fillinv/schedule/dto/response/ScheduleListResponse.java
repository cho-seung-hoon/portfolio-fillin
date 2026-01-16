package com.kosa.fillinv.schedule.dto.response;

import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import java.time.Instant;

public record ScheduleListResponse( // 스케쥴 상태 일치 조회
        String scheduleId,
        String lessonTitle,
        String mentorNickname,
        String menteeNickname,
        Instant startTime,
        ScheduleStatus status,
        Integer price,
        String lessonType,
        String optionName
) {
    public static ScheduleListResponse from(Schedule s, String mentorNickname, String menteeNickname,
            Instant startTime) {
        return new ScheduleListResponse(
                s.getId(),
                s.getLessonTitle(),
                mentorNickname,
                menteeNickname,
                startTime,
                s.getStatus(),
                s.getPrice(),
                s.getLessonType(),
                s.getOptionName()
        );
    }
}
