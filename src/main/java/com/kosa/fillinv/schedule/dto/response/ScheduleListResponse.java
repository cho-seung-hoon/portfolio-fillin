package com.kosa.fillinv.schedule.dto.response;

import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;

import java.time.Instant;

public record ScheduleListResponse( // 스케쥴 상태 일치 조회
        String scheduleId,
        String lessonTitle,
        String mentorNickname,
        String menteeNickname,
        Instant startTime,
        Instant endTime,
        Integer price,
        ScheduleStatus status,
        String lessonType,
        String optionName,
        String userRole // "MENTOR" 또는 "MENTEE"
) {
    // 역할이 이미 정해진 목록 조회용 (mentee/mentor 전용 API)
    public static ScheduleListResponse from(Schedule s, String mentorNickname, String menteeNickname, Instant startTime) {
        return new ScheduleListResponse(
                s.getId(),
                s.getLessonTitle(),
                mentorNickname,
                menteeNickname,
                startTime,
                null,
                s.getPrice(),
                s.getStatus(),
                s.getLessonType(),
                s.getOptionName(),
                null // 역할을 굳이 보내지 않음
        );
    }

    public static ScheduleListResponse from(Schedule s, String mentorNickname, String menteeNickname, ScheduleTime scheduleTime, String userRole) {
        return new ScheduleListResponse(
                s.getId(),
                s.getLessonTitle(),
                mentorNickname,
                menteeNickname,
                scheduleTime.getStartTime(),
                scheduleTime.getEndTime(),
                s.getPrice(),
                s.getStatus(),
                s.getLessonType(),
                s.getOptionName(),
                userRole
        );
    }

    // 역할 구분이 필요한 통합 조회용 (캘린더/상세 API)
    public static ScheduleListResponse from(Schedule s, String mentorNickname, String menteeNickname, Instant startTime, String userRole) {
        return new ScheduleListResponse(
                s.getId(),
                s.getLessonTitle(),
                mentorNickname,
                menteeNickname,
                startTime,
                null,
                s.getPrice(),
                s.getStatus(),
                s.getLessonType(),
                s.getOptionName(),
                userRole
        );
    }
}
