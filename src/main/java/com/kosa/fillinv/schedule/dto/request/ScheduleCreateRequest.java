package com.kosa.fillinv.schedule.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleCreateRequest( // 스케쥴 생성 (요청)
                                     LocalDate date,
                                     LocalTime startTime,
                                     LocalTime endTime,
                                     String requestContent
) {
}



