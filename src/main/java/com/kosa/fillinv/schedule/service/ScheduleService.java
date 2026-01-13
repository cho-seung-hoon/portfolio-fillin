package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.lesson.repository.AvailableTimeRepository;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.repository.OptionRepository;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.repository.MemberRepository;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.dto.response.ScheduleDetailResponse;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true) // 기본적으로 모든 메서드는 읽기 전용 트랜잭션으로 동작
@RequiredArgsConstructor // final이 붙은 필드의 생성자를 자동으로 생성
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final LessonRepository lessonRepository;
    private final OptionRepository optionRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final CategoryRepository categoryRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public String createSchedule(String memberId, ScheduleCreateRequest request) {
        Lesson lesson = getLesson(request.lessonId());

        Schedule schedule = switch (lesson.getLessonType()) {
            case MENTORING -> createMentoringSchedule(lesson, memberId, request);
            case ONEDAY -> createOnedaySchedule(lesson, memberId, request);
            case STUDY -> createStudySchedule(lesson, memberId);
            default -> throw new BusinessException(ErrorCode.INVALID_LESSON_TYPE);
        };

        scheduleRepository.save(schedule);
        return schedule.getId();
    }

    private Schedule createMentoringSchedule(
            Lesson lesson,
            String memberId,
            ScheduleCreateRequest request
    ) {
        Option option = getOption(request.optionId());

        Schedule schedule = buildBaseSchedule(lesson, memberId, option, null, option.getPrice());

        Instant startTime = request.startTime();
        Instant endTime = startTime.plus(option.getMinute(), ChronoUnit.MINUTES);

        schedule.addScheduleTime(
                ScheduleTime.of(startTime, endTime, schedule)
        );

        return schedule;
    }

    private Schedule createOnedaySchedule(
            Lesson lesson,
            String memberId,
            ScheduleCreateRequest request
    ) {
        AvailableTime availableTime = getAvailableTime(request.availableTimeId());

        Schedule schedule = buildBaseSchedule(lesson, memberId, null, availableTime, availableTime.getPrice());

        schedule.addScheduleTime(
                ScheduleTime.of(
                        availableTime.getStartTime(),
                        availableTime.getEndTime(),
                        schedule
                )
        );

        return schedule;
    }

    private Schedule createStudySchedule(
            Lesson lesson,
            String memberId
    ) {
        Schedule schedule = buildBaseSchedule(lesson, memberId, null, null, lesson.getPrice());

        List<ScheduleTime> times = availableTimeRepository
                .findAllByLessonId(lesson.getId())
                .stream()
                .map(at -> ScheduleTime.of(at.getStartTime(), at.getEndTime(), schedule))
                .toList();

        schedule.addScheduleTime(times);
        return schedule;
    }

    private Schedule buildBaseSchedule(
            Lesson lesson,
            String memberId,
            Option option,
            AvailableTime availableTime,
            Integer price
    ) {
        Category category = getCategory(lesson.getCategoryId());
        Member mentor = getMentor(lesson.getMentorId());

        return Schedule.builder()
                .id(UUID.randomUUID().toString())
                .mentorId(lesson.getMentorId())
                .menteeId(memberId)
                .mentorNickname(mentor.getNickname())
                .lessonId(lesson.getId())
                .lessonTitle(lesson.getTitle())
                .lessonType(lesson.getLessonType().name())
                .lessonDescription(lesson.getDescription())
                .lessonLocation(
                        lesson.getLocation() != null ? lesson.getLocation() : "장소 미정"
                )
                .lessonCategoryName(category.getName())
                .price(price)
                .optionId(option != null ? option.getId() : null)
                .optionName(option != null ? option.getName() : null)
                .optionMinute(option != null ? option.getMinute() : null)
                .availableTimeId(availableTime != null ? availableTime.getId() : null)
                .status(ScheduleStatus.PAYMENT_PENDING)
                .scheduleTimeList(new ArrayList<>())
                .build();
    }

    private Member getMentor(String mentorId) {
        return memberRepository.findById(mentorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENTOR_NOT_FOUND));
    }

    private Lesson getLesson(String lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LESSON_NOT_FOUND));
    }

    private Option getOption(String optionId) {
        return optionRepository.findById(optionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OPTION_NOT_FOUND));
    }

    private AvailableTime getAvailableTime(String id) {
        return availableTimeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.AVAILABLE_TIME_NOT_FOUND));
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    // 스케쥴 상세 조회
    public ScheduleDetailResponse getScheduleById(String scheduleId) {
        // 스케쥴 조회
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 멘토 닉네임 조회
        String mentorNickname = memberRepository.findById(schedule.getMentor())
                .map(Member::getNickname)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 멘티 닉네임 조회
        String menteeNickname = memberRepository.findById(schedule.getMentee())
                .map(Member::getNickname)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // entity -> dto 변환
        return ScheduleDetailResponse.from(schedule, mentorNickname, menteeNickname);
    }

    // 상태 일치 스케쥴 조회(결제 대기, 승인 대기, 승인, 취소, 완료)

    // 사용자는 멘토랑 멘티의 역할 구분 없이 원하면 두가지 기능을 모두 사용 가능
    // 수강 신청한 스케쥴 목록 조회(단건 / 멘티 모드) - get
//    public Page<ScheduleReponse> getMenteeSchedules(String memberId, Pageable pageable) {
//        // DB에서 사용자의 ID가 적힌 스케쥴 전부 찾기
//        Page<Schedule> schedules = scheduleRepository.findByMentee(memberId, pageable);
//        // entity -> dto 변환
//        return schedules.map(ScheduleListResponse::from);
//    }

    // 가르치는 수업의 스케쥴 목록 조회(단건 / 멘토 모드) - get
//    public Page<ScheduleResponse> getMentorSchedules(String memberId, Pageable pageable) {
//        // DB에서 사용자가 멘토인 수업에 달린 스케쥴 전부 찾기
//        Page<Schedule> schedules = scheduleRepository.findByMentor(memberId, pageable);
//        return schedules.map(ScheduleListResponse::from);
//    }
}
