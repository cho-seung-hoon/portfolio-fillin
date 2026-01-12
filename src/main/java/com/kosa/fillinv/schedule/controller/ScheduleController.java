package com.kosa.fillinv.schedule.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 스케쥴 생성
    @PostMapping
    public ResponseEntity<SuccessResponse<Void>> createSchedule(
            @AuthenticationPrincipal String memberId, // 로그인한 사용자 ID
            @RequestBody ScheduleCreateRequest request, String lessonId
    ) {
        String scheduleId = scheduleService.createSchedule(memberId, request, lessonId);

        // 201 Created 상태 코드 반환
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SuccessResponse.success(HttpStatus.valueOf(scheduleId)));
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
