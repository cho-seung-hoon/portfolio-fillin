package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
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
import com.kosa.fillinv.schedule.dto.response.ScheduleDetailResponse;
import com.kosa.fillinv.schedule.dto.response.ScheduleListResponse;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.exception.ScheduleException;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import com.kosa.fillinv.schedule.repository.ScheduleTimeRepository;
import com.kosa.fillinv.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final ScheduleTimeRepository scheduleTimeRepository;
    private final StockRepository stockRepository;

    @Transactional
    public String createSchedule(String memberId, ScheduleCreateRequest request) { // 스케쥴 생성
        Lesson lesson = getLesson(request.lessonId());

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

        return saved.getId();
    }

    private Schedule createMentoringSchedule( // 1:1 멘토링 스케쥴 생성
            Lesson lesson,
            String memberId,
            ScheduleCreateRequest request
    ) {
        Option option = getOption(request.optionId());

        Schedule schedule = buildBaseSchedule(lesson, memberId, option, null, option.getPrice());

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

    private Schedule createStudySchedule( // 1:N 스터디 스케쥴 생성
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

    private Schedule buildBaseSchedule( // 스케쥴 기본 정보 설정
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

    private void decreaseStock(String key) {
        if (stockRepository.decreaseQuantity(key) == 0) {
            throw new ScheduleException(ErrorCode.NO_SEAT);
            }
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

    private Schedule getSchedule(String scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_NOT_FOUND));
    }

    private ScheduleTime getScheduleTime(String scheduleTimeId) {
        return scheduleTimeRepository.findById(scheduleTimeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_TIME_NOT_FOUND));
    }

    private String getNickname(String memberId) {
        return memberRepository.findById(memberId)
                .map(Member::getNickname)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }

    @Transactional
    public void completePayment(String scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_NOT_FOUND));

        schedule.markPaymentCompleted();
    }

    // 스케쥴 상세 조회
    public ScheduleDetailResponse getScheduleDetail(String scheduleId, String scheduleTimeId) {
        Schedule schedule = getSchedule(scheduleId);
        ScheduleTime scheduleTime = getScheduleTime(scheduleTimeId);

        // 스케쥴과 스케쥴 타임이 연결되어 있는지 확인
        if (!scheduleTime.getSchedule().getId().equals(scheduleId)) {
            throw new BusinessException(ErrorCode.SCHEDULE_TIME_MISMATCH);
        }

        String mentorNickname = schedule.getMentorNickname();
        String menteeNickname = getNickname(schedule.getMenteeId());

        // entity -> dto 변환
        // 사용자가 선택한 시간을 보여줘야 하므로 startTime 파라미터 추가
        return ScheduleDetailResponse.from(schedule, mentorNickname, menteeNickname, scheduleTime.getStartTime(), scheduleTime.getEndTime());
    }

    // 상태 일치 스케쥴 조회(결제 대기, 승인 대기, 승인, 취소, 완료) / 스케쥴 1개 조회이기 떄문에 페이지 네이션 불필요
    public ScheduleListResponse getScheduleStatus(String scheduleId, ScheduleStatus status) {
        Schedule schedule = getSchedule(scheduleId);

        // 프론트가 보낸 상태와 실제 DB의 상태가 일치하는지 확인
        if (schedule.getStatus() != status) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }

        String mentorNickname = getNickname(schedule.getMentorId());
        String menteeNickname = getNickname(schedule.getMenteeId());

        // 여러 개의 수업 시간 중 가장 먼저 시작하는 첫 회차 시간을 대표로 사용
        Instant startTime = schedule.getScheduleTimeList().stream()
                .findFirst()
                .map(ScheduleTime::getStartTime)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_TIME_NOT_FOUND));

        return ScheduleListResponse.from(schedule, mentorNickname, menteeNickname, startTime);
    }

    // 멘토, 멘티 스케쥴 목록 조회 공통 변환 로직 분리
    private Page<ScheduleListResponse> convertToDetailResponsePage(Page<Schedule> schedules) {
        if (schedules.isEmpty()) { // 조회된 스케쥴이 없으면 빈 페이지 반환
            return Page.empty();
        }

        // 현재 페이지에 있는 스케쥴에서 모든 멘티 ID 추출 (중복 제거) - N + 1 문제 해결을 위한 사전 조회
        List<String> menteeIds = schedules.stream()
                .map(Schedule::getMenteeId)
                .distinct()
                .toList();

        // 뽑아낸 리스트에서 멘티 닉네임 한 번에 조회 (단 한번의 쿼리로 모든 멘티 닉네임 가져오기 => 속도 향상)
        Map<String, String> menteeNicknameMap = memberRepository.findAllById(menteeIds).stream()
                .collect(Collectors.toMap(
                        Member::getId, // Key: 멤버의 ID
                        Member::getNickname // Value: 멤버의 닉네임
                ));

        return schedules.map(s -> {
            String mentorNickname = s.getMentorNickname();
            String menteeNickname = menteeNicknameMap.get(s.getMenteeId()); // Map에서 멘티 닉네임 꺼내기

            Instant startTime = s.getScheduleTimeList().stream()
                    .findFirst()
                    .map(ScheduleTime::getStartTime)
                    .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_TIME_NOT_FOUND));

            return ScheduleListResponse.from(s, mentorNickname, menteeNickname, startTime);
        });
    }

    // 사용자는 멘토랑 멘티의 역할 구분 없이 원하면 두가지 기능을 모두 사용 가능
    // 수강 신청한 스케쥴 목록 조회(단건 / 멘티 모드) - get
    public Page<ScheduleListResponse> getMenteeSchedules(String memberId, Pageable pageable) {
        // 멘티의 스케쥴을 페이지 단위로 가져옴 (Limit 10, Offset 0)
        Page<Schedule> schedules = scheduleRepository.findByMenteeId(memberId, pageable);
        return convertToDetailResponsePage(schedules);
    }

    // 가르치는 수업의 스케쥴 목록 조회(단건 / 멘토 모드) - get
    public Page<ScheduleListResponse> getMentorSchedules(String memberId, Pageable pageable) {
        // 멘토의 스케쥴을 페이지 단위로 가져옴
        Page<Schedule> schedules = scheduleRepository.findByMentorId(memberId, pageable);
        return convertToDetailResponsePage(schedules);
    }
}
