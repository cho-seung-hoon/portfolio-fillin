package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.repository.MemberRepository;
import com.kosa.fillinv.schedule.dto.request.ScheduleSearchRequest;
import com.kosa.fillinv.schedule.dto.response.ScheduleDetailResponse;
import com.kosa.fillinv.schedule.dto.response.ScheduleListResponse;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ScheduleInquiryService { // 스케줄 조회 서비스

    private final ScheduleValidator validator;
    private final ScheduleRepository scheduleRepository;
    private final MemberRepository memberRepository;

    // ------- Public API - 외부 호출 핵심 메서드
    // 캘린더 및 전체 스케쥴 조회 (날짜가 없으면 전체, 있으면 해당 일자 조회)
    public Page<ScheduleListResponse> getCalendarSchedules(String loginMemberId, ScheduleSearchRequest filter, Pageable pageable) {

        // LocalDateTime 범위 변수 선언
        LocalDateTime start = null;
        LocalDateTime end = null;

        if (filter.date() != null) {
            start = filter.date().atStartOfDay();
            end = start.plusDays(1); // 다음 날 0시
        }
        return getFilteredPage(loginMemberId, filter, start, end, pageable);
    }

    // 예정 스케쥴 조회 (현재 시간 이후)
    public Page<ScheduleListResponse> getUpcomingSchedules(String loginMemberId, ScheduleSearchRequest filter, Pageable pageable) {
        // start를 현재시간으로 고정하여 미래 데이터만 조회
        return getFilteredPage(loginMemberId, filter, LocalDateTime.now(), null, pageable);
    }

    // 과거 스케쥴 조회 (현재 시간 이전)
    public Page<ScheduleListResponse> getPastSchedules(String loginMemberId, ScheduleSearchRequest filter, Pageable pageable) {
        // 정렬 조건만 내림차순으로 변경
        Pageable sortedByDesc = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("startTime").descending()
        );
        // end를 현재시간으로 고정하여 과거 데이터만 조회
        return getFilteredPage(loginMemberId, filter, null, LocalDateTime.now(), pageable);
    }

    // 스케쥴 상세 조회
    public ScheduleDetailResponse getScheduleDetail(String scheduleId, String scheduleTimeId) {
        Schedule schedule = validator.getSchedule(scheduleId);
        ScheduleTime scheduleTime = validator.getScheduleTime(scheduleTimeId);

        // 스케쥴과 스케쥴 타임이 연결되어 있는지 확인
        if (!scheduleTime.getSchedule().getId().equals(scheduleId)) {
            throw new BusinessException(ErrorCode.SCHEDULE_TIME_MISMATCH);
        }

        String mentorNickname = schedule.getMentorNickname();
        String menteeNickname = validator.getNickname(schedule.getMenteeId());

        // entity -> dto 변환
        // 사용자가 선택한 시간을 보여줘야 하므로 startTime 파라미터 추가
        return ScheduleDetailResponse.from(
                schedule,
                mentorNickname,
                menteeNickname,
                scheduleTime.getStartTime(),
                scheduleTime.getEndTime());
    }

    // 상태 일치 스케쥴 조회(결제 대기, 승인 대기, 승인, 취소, 완료) / 스케쥴 1개 조회이기 떄문에 페이지 네이션 불필요
    public ScheduleListResponse getScheduleByStatus(String scheduleId, ScheduleStatus status) {
        Schedule schedule = validator.getSchedule(scheduleId);

        // 프론트가 보낸 상태와 실제 DB의 상태가 일치하는지 확인
        if (schedule.getStatus() != status) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }

        String mentorNickname = validator.getNickname(schedule.getMentorId());
        String menteeNickname = validator.getNickname(schedule.getMenteeId());

        // 여러 개의 수업 시간 중 가장 먼저 시작하는 첫 회차 시간을 대표로 사용
        Instant startTime = schedule.getScheduleTimeList().stream()
                .findFirst()
                .map(ScheduleTime::getStartTime)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_TIME_NOT_FOUND));

        return ScheduleListResponse.from(
                schedule,
                mentorNickname,
                menteeNickname,
                startTime);
    }

    // 사용자는 멘토랑 멘티의 역할 구분 없이 원하면 두가지 기능을 모두 사용 가능
    // 수강 신청한 스케쥴 목록 조회(단건 / 멘티 모드) - get
    public Page<ScheduleListResponse> getMenteeSchedules(String memberId, Pageable pageable) {
        // 멘티의 스케쥴을 페이지 단위로 가져옴 (Limit 10, Offset 0)
        Page<Schedule> schedules = scheduleRepository.findByMenteeId(memberId, pageable);
        return convertToScheduleListResponsePage(schedules, memberId);
    }

    // 가르치는 수업의 스케쥴 목록 조회(단건 / 멘토 모드) - get
    public Page<ScheduleListResponse> getMentorSchedules(String memberId, Pageable pageable) {
        // 멘토의 스케쥴을 페이지 단위로 가져옴
        Page<Schedule> schedules = scheduleRepository.findByMentorId(memberId, pageable);
        return convertToScheduleListResponsePage(schedules, memberId);
    }

    // ------- Private Method - 내부 보조 메서드 (비즈니스 로직)
    // 멘토, 멘티 스케쥴 목록 조회 공통 변환 로직 분리
    // N + 1 문제 해결을 위한 멘티 닉네임 일괄 조회 포함
    private Page<ScheduleListResponse> convertToScheduleListResponsePage(Page<Schedule> schedules, String loginMemberId) {
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
            // 조회하는 시점에 로그인한 사용자의 ID와 스케쥴에 저장된 ID 비교 (현재 로그인한 사용자가 이 스케쥴에서 어떤 역할인지 판별)
            // 로그인 ID == schedule.mentorId 이면 → userRole = "MENTOR"
            // 로그인 ID == schedule.menteeId 이면 → userRole = "MENTEE"
            String userRole = s.getMentorId().equals(loginMemberId) ? "MENTOR" : "MENTEE";

            String mentorNickname = s.getMentorNickname();
            String menteeNickname = menteeNicknameMap.get(s.getMenteeId()); // Map에서 멘티 닉네임 꺼내기

            // 여러 개의 수업 시간 중 가장 먼저 시작하는 첫 회차 시간을 대표로 사용
            Instant startTime = s.getScheduleTimeList().stream()
                    .findFirst()
                    .map(ScheduleTime::getStartTime)
                    .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULE_TIME_NOT_FOUND));

            return ScheduleListResponse.from(
                    s,
                    mentorNickname,
                    menteeNickname,
                    startTime,
                    userRole);
        });
    }

    // 특정 날짜 검색, 예정 스케쥴, 과거 스케쥴 조회 공통 로직 (실제 필터링 및 조회)
    private Page<ScheduleListResponse> getFilteredPage(String loginMemberId, ScheduleSearchRequest filter, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        // LocalDateTime -> Instant 변환
        Instant startInstant = (start != null)
                ? start.atZone(ZoneId.of("Asia/Seoul")).toInstant()
                : null;
        Instant endInstant = (end != null)
                ? end.atZone(ZoneId.of("Asia/Seoul")).toInstant()
                : null;

        // filter에서 title을 꺼내는데 검색어가 없을 경우 null 처리
        String titleParam = (filter.title() != null && !filter.title().isBlank()) ? filter.title() : null;
        // 상태값 String을 Enum으로 변환하거나 null 처리
        ScheduleStatus statusParam = (filter.status() != null && !filter.status().isBlank())
                ? ScheduleStatus.valueOf(filter.status().toUpperCase()) // Enum 변환
                : null;

        // 로그인한 사용자가 연관된 스케줄을 필터링
        Page<Schedule> schedulePage = scheduleRepository.findAllByMemberIdWithFilter(loginMemberId, titleParam, startInstant, endInstant, statusParam, pageable);
        return convertToScheduleListResponsePage(schedulePage, loginMemberId);
    }
}
