package com.kosa.fillinv.schedule.dto.request;

import java.time.Instant;

public record ScheduleCreateRequest(
        // 스케쥴 생성 (요청)
        String lessonId,
        String optionId, // Option에서 minutes 가져옴
        String availableTimeId,
        Instant startTime // 표준 시간 적용 - option 의 minutes 더해서 endTime 계산
) {
}
