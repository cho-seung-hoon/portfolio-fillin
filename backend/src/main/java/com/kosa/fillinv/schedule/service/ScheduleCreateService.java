package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.lesson.repository.AvailableTimeRepository;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.exception.ScheduleException;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.kosa.fillinv.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor // final이 붙은 필드의 생성자를 자동으로 생성
public class ScheduleCreateService { // 스케줄 생성 서비스

    private final ScheduleValidator validator;
    private final ScheduleMapper mapper;
    private final ScheduleRepository scheduleRepository;
    private final StockRepository stockRepository;
    private final AvailableTimeRepository availableTimeRepository;

    // ------- Public API - 외부 호출 핵심 메서드
    public String createSchedule(String memberId, ScheduleCreateRequest request) { // 스케쥴 생성
        Lesson lesson = validator.getLesson(request.lessonId());

        Schedule schedule = switch (lesson.getLessonType()) { // 레슨 유형에 따라 스케쥴 생성 방식 분기 (1:1 멘토링, 1:N 원데이, 1:N 스터디)
            case MENTORING -> createMentoringSchedule(lesson, memberId, request);
            case ONEDAY -> createOnedaySchedule(lesson, memberId, request);
            case STUDY -> createStudySchedule(lesson, memberId);
            default -> throw new BusinessException(ErrorCode.INVALID_LESSON_TYPE);
        };

        Schedule saved = scheduleRepository.save(schedule);

        if (lesson.getLessonType() == LessonType.ONEDAY) {
            decreaseStock(saved.getAvailableTimeId());
        } else if (lesson.getLessonType() == LessonType.STUDY) {
            decreaseStock(saved.getLessonId());
        }

        scheduleRepository.save(schedule);
        return schedule.getId();
    }

    private void decreaseStock(String key) {
        if (stockRepository.decreaseQuantity(key) == 0) {
            throw new ScheduleException(ErrorCode.NO_SEAT);
        }
    }

    // ------- Private Method - 내부 보조 메서드 (비즈니스 로직)
    private Schedule createMentoringSchedule( // 1:1 멘토링 스케쥴 생성
            Lesson lesson,
            String memberId,
            ScheduleCreateRequest request
    ) {
        Option option = validator.getOption(request.optionId());

        Schedule schedule = mapper.buildBaseSchedule(lesson, memberId, option, null, option.getPrice());

        Instant startTime = request.startTime();
        Instant endTime = startTime.plus(option.getMinute(), ChronoUnit.MINUTES); // 옵션의 분 단위를 더해서 종료 시간 계산

        schedule.addScheduleTime(
                ScheduleTime.of(startTime, endTime, schedule)
        );

        return schedule;
    }

    private Schedule createOnedaySchedule( // 1:N 원데이 스케쥴 생성
            Lesson lesson,
            String memberId,
            ScheduleCreateRequest request
    ) {
        AvailableTime availableTime = validator.getAvailableTime(request.availableTimeId());

        Schedule schedule = mapper.buildBaseSchedule(lesson, memberId, null, availableTime, availableTime.getPrice());

        schedule.addScheduleTime(
                ScheduleTime.of(
                        availableTime.getStartTime(),
                        availableTime.getEndTime(),
                        schedule
                )
        );

        return schedule;
    }

    private Schedule createStudySchedule( // 1:N 스터디 스케쥴 생성
            Lesson lesson,
            String memberId
    ) {
        Schedule schedule = mapper.buildBaseSchedule(lesson, memberId, null, null, lesson.getPrice());

        List<ScheduleTime> times = availableTimeRepository
                .findAllByLessonId(lesson.getId())
                .stream()
                .map(at -> ScheduleTime.of(at.getStartTime(), at.getEndTime(), schedule))
                .toList();

        schedule.addScheduleTime(times);
        return schedule;
    }
}
