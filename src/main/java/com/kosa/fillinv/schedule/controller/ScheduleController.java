package com.kosa.fillinv.schedule.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
            // @AuthenticationPrincipal String memberId, // 로그인한 사용자 ID
            @RequestBody ScheduleCreateRequest request, String lessonId
    ) {
        String memberId = "mentor01";

        String scheduleId = scheduleService.createSchedule(memberId, request, lessonId);

        // 201 Created 상태 코드 반환
        return ResponseEntity
                .created(java.net.URI.create("api/v1/schedules/" + scheduleId)) // 생성된 스케쥴 조회할 수 있는 uri을 알려줌
                .body(SuccessResponse.success(null)); // 보내줄 데이터가 없기에 null - 데이터는 헤더에 존재 (데이터가 주소이기 때문에 헤더에 위치)
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
