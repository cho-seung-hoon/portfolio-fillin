package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ScheduleInquiryServiceTest {

    @Autowired
    private ScheduleInquiryService scheduleService;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @BeforeEach
    void setUp() {
        scheduleRepository.deleteAll();

        Schedule s1 = createSchedule(
                "schedule-1",
                ScheduleStatus.APPROVED,
                "Spring 백엔드 멘토링",
                "mentor-1",
                "mentee-1",
                Instant.now().minus(3, ChronoUnit.DAYS)
        );

        Schedule s2 = createSchedule(
                "schedule-2",
                ScheduleStatus.COMPLETED,
                "Java 심화 멘토링",
                "mentor-1",
                "mentee-2",
                Instant.now().minus(1, ChronoUnit.DAYS)
        );

        Schedule s3 = createSchedule(
                "schedule-3",
                ScheduleStatus.PAYMENT_PENDING,
                "React 입문",
                "mentor-2",
                "mentee-1",
                Instant.now().minus(2, ChronoUnit.DAYS)
        );

        // ScheduleTime 추가 (STUDY / ONEDAY 테스트용)
        s1.addScheduleTime(
                createScheduleTime(
                        s1,
                        Instant.now().plus(1, ChronoUnit.DAYS),
                        Instant.now().plus(1, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS)
                )
        );

        s2.addScheduleTime(
                createScheduleTime(
                        s2,
                        Instant.now().plus(2, ChronoUnit.DAYS),
                        Instant.now().plus(2, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS)
                )
        );

        scheduleRepository.saveAll(List.of(s1, s2, s3));
    }

//    @Test
//    @DisplayName("검색 조건이 없으면 기본 조건으로 스케줄을 조회한다")
//    void search_default_condition() {
//        // given
//        ScheduleSearchCondition condition = ScheduleSearchCondition.defaultCondition();
//
//        // when
//        Page<Schedule> result = scheduleService.search(condition);
//
//        // then
//        assertNotNull(result);
//        assertEquals(0, result.getPageable().getPageNumber());
//        assertEquals(10, result.getPageable().getPageSize());
//
//        Sort.Order order = result.getPageable().getSort()
//                .getOrderFor("createdAt");
//
//        assertNotNull(order);
//        assertEquals(Sort.Direction.ASC, order.getDirection());
//    }


    private ScheduleTime createScheduleTime(
            Schedule schedule,
            Instant start,
            Instant end
    ) {
        return ScheduleTime.of(start, end, schedule);
    }

    private Schedule createSchedule(
            String id,
            ScheduleStatus status,
            String lessonTitle,
            String mentorId,
            String menteeId,
            Instant createdAt
    ) {
        Schedule schedule = Schedule.builder()
                .id(id)
                .status(status)
                .requestContent("요청 사항입니다")
                .lessonTitle(lessonTitle)
                .lessonType("MENTORING")
                .lessonDescription("설명")
                .lessonLocation("ONLINE")
                .lessonCategoryName("백엔드")
                .mentorNickname("멘토닉")
                .optionName("30분")
                .optionMinute(30)
                .price(30000)
                .lessonId("lesson-" + id)
                .mentorId(mentorId)
                .menteeId(menteeId)
                .optionId("option-" + id)
                .build();

        // BaseEntity의 createdAt 세팅 (Reflection 또는 setter 사용)
        ReflectionTestUtils.setField(schedule, "createdAt", createdAt);

        return schedule;
    }

}