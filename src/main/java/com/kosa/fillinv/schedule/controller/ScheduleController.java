package com.kosa.fillinv.schedule.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.dto.response.ScheduleDetailResponse;
import com.kosa.fillinv.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 스케쥴 생성
    @PostMapping
    public ResponseEntity<SuccessResponse<Void>> createSchedule(
            @AuthenticationPrincipal String memberId, // 로그인한 사용자 ID
            @RequestBody ScheduleCreateRequest request
    ) {
        // 테스트용 memberId - DB의 member 테이블에 실제로 존재하는 ID를 넣으세요
        if (memberId == null) {
            memberId = "1";
        }

        String scheduleId = scheduleService.createSchedule(memberId, request);

        // 요청 주소 - ServletUriComponentsBuilder 사용 시 서버 주소가 바뀌더라도 코드를 수정하지 않아도 됨
        // 멘토, 멘티의 스케쥴 상세 보기 주소를 Location 헤더에 담아주기
        java.net.URI location = ServletUriComponentsBuilder
                .fromCurrentRequest() // 현재 요청 주소 가져오기
                .path("/{id}") // /{id} 추가
                .buildAndExpand(scheduleId) // {id} 자리에 scheduleId 넣기
                .toUri(); // URI로 변환

        // Created 응답 시 Body 대신 Location 헤더에 리소스 URI 반환
        return ResponseEntity
                .created(location) // 생성된 스케쥴 조회할 수 있는 uri을 알려줌
                .body(SuccessResponse.success(HttpStatus.OK)); // 보내줄 데이터가 없기에 null - 데이터는 헤더에 존재 (데이터가 주소이기 때문에 헤더에 위치)
    }

    // 스케쥴 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<ScheduleDetailResponse>> getScheduleDetails(
            @PathVariable("id") String scheduleId
    ) {
        ScheduleDetailResponse response = scheduleService.getScheduleById(scheduleId);

        return ResponseEntity
                .ok(SuccessResponse.success(HttpStatus.OK, response));
    }

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
