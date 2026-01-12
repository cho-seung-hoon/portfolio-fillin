package com.kosa.fillinv.schedule.controller;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.entity.Schedule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ScheduleControllerTest {

    @Test
    @DisplayName("스케줄 생성 테스트")
    void createSchedule() {
        // given
        String memberId = "mentor01";

        // (2026년 2월 1일 오전 1시 UTC -> 한국 시간 오전 10시)
        Instant startTime = Instant.parse("2026-02-01T01:00:00Z");

        Lesson mockLesson = Lesson.builder()
                .id(java.util.UUID.randomUUID().toString())
                .mentorId(memberId)

                .title("예비 백엔드 개발자를 위한 커피챗")
                .price(25000)
                .description("백엔드 개발자 취업/이직을 위한 포트폴리오 첨삭과 진로 상담을 진행합니다. 현업에서의 경험을 바탕으로 현실적인 조언을 드립니다. (총 진행 시간: 1시간 20분)")

                .lessonType(LessonType.MENTORING)
                .thumbnailImage("mentoring.jpg")
                .location(null)
                .build();

        Option mockOption = Option.builder()
                .id("option01")
                .name("포트폴리오 첨삭 80분")
                .minute(80)
                .price(25000)
                .lesson(mockLesson)
                .build();

        ScheduleCreateRequest request = new ScheduleCreateRequest(
                "lesson01",
                "option01",
                startTime
        );

        // when - Schedule.create 메서드 호출 / Option 객체와 시작 시간을 넘겨줌
        Schedule schedule = Schedule.create(mockLesson, mockOption, request.startTime(), memberId);

        // then
        assertNotNull(schedule);

        // 멘토 아이디가 일치하는지 확인
        assertEquals(memberId, schedule.getMentor());

        // 예상 종료 시간과 생성된 endTime 비교
        Instant expectedEndTime = startTime.plus(80, ChronoUnit.MINUTES);
        assertEquals(expectedEndTime, schedule.getEndTime());

        // 시작 시간 확인 (10:00)
        assertEquals(LocalTime.of(10, 0), schedule.getStartTime());

        // 시작 시간(오전 10시) + Option minutes(80분) = 종료 시간 (11:20)
        assertEquals(LocalTime.of(11, 20), schedule.getEndTime());

        System.out.println(schedule);
    }
}