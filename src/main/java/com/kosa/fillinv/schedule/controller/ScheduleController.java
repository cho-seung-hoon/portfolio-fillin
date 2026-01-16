package com.kosa.fillinv.schedule.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.dto.response.ScheduleDetailResponse;
import com.kosa.fillinv.schedule.dto.response.ScheduleListResponse;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 스케쥴 생성
    @PostMapping
    public ResponseEntity<SuccessResponse<Void>> createSchedule(
            @AuthenticationPrincipal CustomMemberDetails customMemberDetails, // 로그인한 사용자 ID
            @RequestBody ScheduleCreateRequest request
    ) {
        String memberId = customMemberDetails.memberId();

        String scheduleId = scheduleService.createSchedule(memberId, request);

        // 요청 주소 - ServletUriComponentsBuilder 사용 시 서버 주소가 바뀌더라도 코드를 수정하지 않아도 됨
        // 멘토, 멘티의 스케쥴 상세 보기 주소를 Location 헤더에 담아주기
        java.net.URI location = ServletUriComponentsBuilder
                .fromCurrentRequest() // 현재 요청 주소 가져오기
                .path("/{id}") // /{id} 추가
                .buildAndExpand(scheduleId) // {id} 자리에 scheduleId 넣기
                .toUri(); // URI로 변환

        return ResponseEntity
                .created(location) // Created 응답 시 Body 대신 Location 헤더에 리소스 URI 반환
                .body(SuccessResponse.success(HttpStatus.CREATED));
    }

    // 스케쥴 전체 조회 (GET) - 시간순 정렬 (D-day가 적게 남은 순으로 정렬)

    // 스케쥴 상세 조회
    @GetMapping("/{scheduleId}/times/{scheduleTimeId}")
    public ResponseEntity<SuccessResponse<ScheduleDetailResponse>> getScheduleDetails(
            @PathVariable String scheduleId,
            @PathVariable String scheduleTimeId
    ) {
        ScheduleDetailResponse response = scheduleService.getScheduleDetail(scheduleId, scheduleTimeId);

        return ResponseEntity
                .ok(SuccessResponse.success(HttpStatus.OK, response));
    }

    // 상태 일치 스케쥴 조회
    // Ex: GET /api/v1/schedules/SCH001/status/PAYMENT_PENDING
    @GetMapping("/{scheduleId}/status/{status}")
    public ResponseEntity<SuccessResponse<ScheduleListResponse>> getScheduleStatus(
            @PathVariable String scheduleId,
            @PathVariable ScheduleStatus status
    ) {
        ScheduleListResponse response = scheduleService.getScheduleStatus(scheduleId, status);

        return ResponseEntity
                .ok(SuccessResponse.success(HttpStatus.OK, response));
    }

    // 스케쥴 상태 변경 (PATCH)

    // 멘티 모드: 내 수강 신청 목록 조회 (페이지네이션)
    // Ex: GET /api/v1/schedules/mentee/MEMBER001?page=0&size=10
    @GetMapping("/mentee/{memberId}") // role=MENTOR or role=MENTEE
    public ResponseEntity<SuccessResponse<Page<ScheduleListResponse>>> getMenteeSchedules(
            @PathVariable String memberId,
            // 기본 10개씩, 생성일자 기준 내림차순(최신순)
            @ParameterObject Pageable pageable
    ) {
        Page<ScheduleListResponse> responses = scheduleService.getMenteeSchedules(memberId, pageable);
        return ResponseEntity.ok(SuccessResponse.success(HttpStatus.OK, responses));
    }

    // 멘토 모드: 내 수업 일정 목록 조회 (페이지네이션)
    // Ex: GET /api/v1/schedules/mentor/MEMBER002?page=0&size=10
    @GetMapping("/mentor/{memberId}") // role=MENTOR or role=MENTEE
    public ResponseEntity<SuccessResponse<Page<ScheduleListResponse>>> getMentorSchedules(
            @PathVariable String memberId,
            @ParameterObject Pageable pageable
    ) {
        Page<ScheduleListResponse> responses = scheduleService.getMentorSchedules(memberId, pageable);
        return ResponseEntity.ok(SuccessResponse.success(HttpStatus.OK, responses));
    }

}