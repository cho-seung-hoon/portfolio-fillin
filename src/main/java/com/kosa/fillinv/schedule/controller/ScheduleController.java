package com.kosa.fillinv.schedule.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 스케쥴 생성
    @PostMapping
    public ResponseEntity<SuccessResponse> createSchedule(
            @AuthenticationPrincipal String memberId, // 로그인한 사용자 ID
            @RequestParam String lessonId, // 어떤 수업의 스케줄인지
            @RequestBody ScheduleCreateRequest request // 상세 내용 (날짜, 시간 등)
    ) {
        scheduleService.createSchedule(memberId, lessonId, request);

        // 201 Created 상태 코드 반환
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SuccessResponse.success(HttpStatus.CREATED));
    }

    // 스케쥴 상세 조회
//    @GetMapping("/{id}")
//    public String getScheduleDetails() {
//        return "";
//    }

    // 상태 일치 스케쥴 조회
//    @GetMapping("/{id}/status")
//    public String getScheduleStatus() {
//        return "";
//    }

    // 멘토, 멘티 스케쥴 조회
//    @GetMapping // role=MENTOR or role=MENTEE
//    public ResponseEntity<Page<ScheduleListResponse>> getSchedules(
//            @RequestParam String role,
//            Pageable pageable
//    ) {
//        System.out.println("role = " + role);
//        return ;
//    }

}
