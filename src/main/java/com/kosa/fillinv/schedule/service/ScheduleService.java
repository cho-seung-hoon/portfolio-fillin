package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.service.MemberService;
import com.kosa.fillinv.schedule.dto.response.ScheduleListResponse;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.repository.ScheduleParticipantRole;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import com.kosa.fillinv.schedule.repository.ScheduleTimeRepository;
import com.kosa.fillinv.schedule.repository.ScheduleTimeSpecifications;
import com.kosa.fillinv.schedule.service.dto.ScheduleSearchCondition;
import com.kosa.fillinv.schedule.service.dto.ScheduleSortType;
import com.kosa.fillinv.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleTimeRepository scheduleTimeRepository;
    private final MemberService memberService;
    private final ScheduleValidator validator;
    private final StockRepository stockRepository;

    // 멤버가 멘티 또는 멘토인 예정 스케줄 모두 조회
    public Page<ScheduleListResponse> findAllUpcomingSchedules(String memberId, Instant from) {
        ScheduleSearchCondition intended = ScheduleSearchCondition.defaultCondition()
                .participate(memberId)
                .toIntended(from);

        return search(intended);
    }

    // 멤버가 멘티 또는 멘토인 과거 스케줄 검색
    public Page<ScheduleListResponse> searchPastSchedules(String memberId, ScheduleSearchCondition condition) {
        ScheduleSearchCondition past = condition
                .participate(memberId)
                .toPast(condition.to());

        return search(past);
    }

    // 멤버가 멘티 또는 멘토인 예정 스케줄 검색
    public Page<ScheduleListResponse> searchUpcomingSchedules(String memberId, ScheduleSearchCondition condition) {
        ScheduleSearchCondition intended = condition
                .participate(memberId)
                .toIntended(condition.from());

        return search(intended);
    }

    // 멤버가 멘티이면서 승인대기 중인 예정 스케쥴 검색
    public Page<ScheduleListResponse> findAllUpcomingApprovalPendingSchedulesAsMentee(String memberId, Instant from) {
        ScheduleSearchCondition intended =
                ScheduleSearchCondition.defaultCondition()
                .mentee(memberId)
                .withStatus(ScheduleStatus.APPROVAL_PENDING)
                .toIntended(from);

        return search(intended);
    }

    // 멤버가 멘토이면서 승인대기 중인 예정 스케쥴 검색
    public Page<ScheduleListResponse> findAllUpcomingApprovalPendingSchedulesAsMentor(String memberId, Instant from) {
        ScheduleSearchCondition intended = ScheduleSearchCondition.defaultCondition()
                .mentor(memberId)
                .withStatus(ScheduleStatus.APPROVAL_PENDING)
                .toIntended(from);

        return search(intended);
    }

    // 해당 기간에 포함되는 일정 조회
    public Page<ScheduleListResponse> calendar(String memberId, Instant start, Instant end, Integer page, Integer size) {
        ScheduleSearchCondition condition = ScheduleSearchCondition.defaultCondition()
                .participate(memberId)
                .between(start, end)
                .withSortType(ScheduleSortType.START_TIME_ASC)
                .withPage(page)
                .withSize(size);

        return search(condition);
    }

    public Page<ScheduleListResponse> search(ScheduleSearchCondition condition) {

        Sort sort = condition.sortType().toSort();
        PageRequest pageRequest =
                PageRequest.of(condition.page(), condition.size(), sort);

        Specification<ScheduleTime> spec =
                ScheduleTimeSpecifications.search(
                        condition.keyword(),
                        condition.from(),
                        condition.to(),
                        condition.status(),
                        condition.participantRole() == ScheduleParticipantRole.MENTOR || condition.participantRole() == ScheduleParticipantRole.BOTH
                                ? condition.memberId() : null,
                        condition.participantRole() == ScheduleParticipantRole.MENTEE  || condition.participantRole() == ScheduleParticipantRole.BOTH
                                ? condition.memberId() : null,
                        condition.participantRole()
                );

        Page<ScheduleTime> page = scheduleTimeRepository.findAll(spec, pageRequest);

        return convert(condition.memberId(), page);
    }

    public Page<ScheduleListResponse> convert(String memberId, Page<ScheduleTime> page) {
        Set<Schedule> schedule = page.getContent().stream()
                .map(ScheduleTime::getSchedule)
                .collect(Collectors.toSet());

        Set<String> memberIds =
                schedule.stream()
                        .flatMap(s -> Stream.of(s.getMentorId(), s.getMenteeId()))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        Map<String, ProfileResponseDto> members = memberService.getAllProfilesByMemberIds(memberIds);

        return page.map(
                scheduleTime -> {
                    Schedule s = scheduleTime.getSchedule();
                    ProfileResponseDto mentor = members.get(s.getMentorId());
                    ProfileResponseDto mentee = members.get(s.getMenteeId());

                    return ScheduleListResponse.from(
                            s,
                            mentor.nickname(),
                            mentee.nickname(),
                            scheduleTime,
                            s.getRole(memberId)
                            );
                }
        );
    }

    @Transactional
    public void completePayment(String scheduleId) {
        Schedule schedule = validator.getSchedule(scheduleId);

        // 결제 대기 상태인 스케쥴만 승인 대기로 상태 변경 가능
        if (schedule.getStatus() != ScheduleStatus.PAYMENT_PENDING) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }

        schedule.updateStatus(ScheduleStatus.APPROVAL_PENDING);
    }

    // 멘토가 멘티의 레슨 수강신청을 승인했을 경우 (승인 대기 -> 승인)
    @Transactional
    public void approveLessonByMentor(String memberId, String scheduleId) {
        Schedule schedule = validator.getSchedule(scheduleId);

        // 대기중인 스케줄 승인은 멘토만 가능
        schedule.validateMentor(memberId);

        // 승인 대기 상태인 스케쥴만 승인으로 상태 변경 가능
        if (schedule.getStatus() != ScheduleStatus.APPROVAL_PENDING) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }

        schedule.updateStatus(ScheduleStatus.APPROVED);
    }


    // 멘토가 멘티의 레슨 수강신청을 거절했을 경우(승인 대기 -> 취소)
    @Transactional
    public void rejectLessonByMentor(String memberId, String scheduleId) {
        Schedule schedule = validator.getSchedule(scheduleId);

        // 스케쥴 취소는 스케쥴 멘토만 가능
        schedule.validateMentor(memberId);

        // 승인 대기 상태인 스케쥴만 취소로 상태 변경 가능
        if (schedule.getStatus() != ScheduleStatus.APPROVAL_PENDING) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }

        schedule.updateStatus(ScheduleStatus.CANCELED);

        LessonType type = LessonType.from(schedule.getLessonType());
        switch (type) {
            case MENTORING -> stockRepository.increaseQuantity(schedule.getOptionId());
            case ONEDAY -> stockRepository.increaseQuantity(schedule.getAvailableTimeId());
            case STUDY -> stockRepository.increaseQuantity(schedule.getId());
        }
    }

    // 해당 레슨 수강이 모두 끝난 경우 (승인 -> 완료)
    @Transactional
    public void completeLesson(String memberId, String scheduleId) {
        Schedule schedule = validator.getSchedule(scheduleId);

        // 스케쥴 완료는 멘티만 가능
        schedule.validateMentee(memberId);

        // 승인 상태인 스케쥴만 완료로 상태 변경 가능
        if (schedule.getStatus() != ScheduleStatus.APPROVED) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }

        schedule.updateStatus(ScheduleStatus.COMPLETED);
    }
}
