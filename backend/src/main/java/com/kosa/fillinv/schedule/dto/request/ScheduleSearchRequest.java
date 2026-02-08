package com.kosa.fillinv.schedule.dto.request;

import io.swagger.v3.oas.annotations.Parameter;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

public record ScheduleSearchRequest(
        @Parameter(description = "조회할 날짜 (yyyy-MM-dd)", required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate date, // 특정일 필터

        @Parameter(required = false)
        String title, // 제목 검색

        @Parameter(required = false)
        String status // 상태 필터 (PAYMENT_PENDING, APPROVED 등)
) {
}
