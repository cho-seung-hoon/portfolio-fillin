package com.kosa.fillinv.schedule.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;

import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.lesson.repository.AvailableTimeRepository;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.repository.OptionRepository;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.repository.MemberRepository;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class ScheduleServiceTest {

    @Autowired
    private ScheduleCreateService scheduleCreateService;

    @Autowired
    private ScheduleInquiryService scheduleInquiryService;

    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private OptionRepository optionRepository;
    @Autowired
    private AvailableTimeRepository availableTimeRepository;
    @Autowired
    private ScheduleRepository scheduleRepository;

    @MockitoSpyBean
    private MemberRepository memberRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void setUp() {
        doReturn(Optional.of(Member.builder().id("mentee-1").nickname("멘토").build()))
                .when(memberRepository)
                .findById(anyString());
    }

    @Test
    @DisplayName("멘토링 레슨 스케줄 생성 성공")
    void createMentoringSchedule() {
        // given
        Lesson lesson = lessonRepository.save(
                Lesson.builder()
                        .id("lesson-1")
                        .title("멘토링 레슨")
                        .lessonType(LessonType.MENTORING)
                        .mentorId("mentor-1")
                        .categoryId(1L)
                        .description("설명")
                        .location("온라인")
                        .thumbnailImage("thumbnail.png")
                        .build()
        );

        Option option = optionRepository.save(
                new Option("option-1", "30분", 30, 30000, lesson)
        );

        Instant startTime = Instant.parse("2025-01-10T10:00:00Z");

        ScheduleCreateRequest request = new ScheduleCreateRequest(
                lesson.getId(),
                option.getId(),
                null,
                startTime
        );

        // when
        String scheduleId = scheduleCreateService.createSchedule("mentee-1", request);
        entityManager.flush();
        entityManager.clear();

        // then
        Schedule schedule = scheduleRepository.findById(scheduleId).orElseThrow();

        assertThat(schedule.getLessonTitle()).isEqualTo("멘토링 레슨");
        assertThat(schedule.getOptionName()).isEqualTo("30분");
        assertThat(schedule.getScheduleTimeList()).hasSize(1);
        assertThat(schedule.getLessonType()).isEqualTo(LessonType.MENTORING.name());
        assertThat(schedule.getMentorId()).isEqualTo("mentor-1");
        assertThat(schedule.getPrice()).isEqualTo(option.getPrice());

        assertThat(schedule.getOptionName()).isEqualTo(option.getName());
        assertThat(schedule.getOptionMinute()).isEqualTo(option.getMinute());

        assertThat(schedule.getScheduleTimeList()).hasSize(1);
        ScheduleTime time = schedule.getScheduleTimeList().get(0);
        assertThat(time.getStartTime()).isEqualTo(startTime);
        assertThat(time.getEndTime()).isEqualTo(startTime.plus(30, ChronoUnit.MINUTES));
    }

    @Test
    @DisplayName("원데이 레슨 스케줄 생성 성공")
    void createOnedaySchedule() {
        // given
        Lesson lesson = lessonRepository.save(
                Lesson.builder()
                        .id("lesson-2")
                        .title("원데이 레슨")
                        .lessonType(LessonType.ONEDAY)
                        .mentorId("mentor-2")
                        .categoryId(1L)
                        .description("설명")
                        .location("오프라인")
                        .thumbnailImage("thumbnail.png")
                        .build()
        );

        AvailableTime availableTime = availableTimeRepository.save(
                new AvailableTime(
                        "at-1",
                        lesson,
                        Instant.parse("2025-02-01T09:00:00Z"),
                        Instant.parse("2025-02-01T12:00:00Z"),
                        50000,
                        5
                )
        );

        ScheduleCreateRequest request = new ScheduleCreateRequest(
                lesson.getId(),
                null,
                availableTime.getId(),
                null
        );

        // when
        String scheduleId = scheduleCreateService.createSchedule("mentee-2", request);
        entityManager.flush();
        entityManager.clear();

        // then
        Schedule schedule = scheduleRepository.findById(scheduleId).orElseThrow();

        assertThat(schedule.getLessonTitle()).isEqualTo("원데이 레슨");
        assertThat(schedule.getOptionName()).isEqualTo(null);
        assertThat(schedule.getScheduleTimeList()).hasSize(1);
        assertThat(schedule.getLessonType()).isEqualTo(LessonType.ONEDAY.name());
        assertThat(schedule.getMentorId()).isEqualTo("mentor-2");
        assertThat(schedule.getPrice()).isEqualTo(availableTime.getPrice());

        assertThat(schedule.getOptionName()).isEqualTo(null);
        assertThat(schedule.getOptionMinute()).isEqualTo(null);

        ScheduleTime time = schedule.getScheduleTimeList().get(0);
        assertThat(time.getStartTime()).isEqualTo(availableTime.getStartTime());
        assertThat(time.getEndTime()).isEqualTo(availableTime.getEndTime());
    }

    @Test
    @DisplayName("스터디 레슨은 AvailableTime 전체가 ScheduleTime으로 생성된다")
    void createStudySchedule() {
        // given
        Lesson lesson = lessonRepository.save(
                Lesson.builder()
                        .id("lesson-3")
                        .title("스터디 레슨")
                        .lessonType(LessonType.STUDY)
                        .mentorId("mentor-3")
                        .categoryId(1L)
                        .description("설명")
                        .location("온라인")
                        .thumbnailImage("thumbnail.png")
                        .price(10000)
                        .build()
        );

        List<AvailableTime> availableTimeList = availableTimeRepository.saveAll(List.of(
                new AvailableTime(
                        "at-1",
                        lesson,
                        Instant.parse("2025-03-01T10:00:00Z"),
                        Instant.parse("2025-03-01T12:00:00Z"),
                        0,
                        5),
                new AvailableTime(
                        "at-2",
                        lesson,
                        Instant.parse("2025-03-08T10:00:00Z"),
                        Instant.parse("2025-03-08T12:00:00Z"),
                        0,
                        6)
        ));

        ScheduleCreateRequest request = new ScheduleCreateRequest(
                lesson.getId(),
                null,
                null,
                null
        );

        // when
        String scheduleId = scheduleCreateService.createSchedule("mentee-3", request);
        entityManager.flush();
        entityManager.clear();

        // then
        Schedule schedule = scheduleRepository.findById(scheduleId).orElseThrow();

        assertThat(schedule.getLessonTitle()).isEqualTo("스터디 레슨");
        assertThat(schedule.getOptionName()).isEqualTo(null);
        assertThat(schedule.getLessonType()).isEqualTo(LessonType.STUDY.name());
        assertThat(schedule.getMentorId()).isEqualTo("mentor-3");
        assertThat(schedule.getPrice()).isEqualTo(lesson.getPrice());

        assertThat(schedule.getScheduleTimeList()).hasSize(availableTimeList.size());
    }
}