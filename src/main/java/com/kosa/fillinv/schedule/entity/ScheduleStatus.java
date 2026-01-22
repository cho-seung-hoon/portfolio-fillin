package com.kosa.fillinv.schedule.entity;

import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
import lombok.Getter;

@Getter
public enum ScheduleStatus {
    PAYMENT_PENDING("결제 대기"),
    APPROVAL_PENDING("승인 대기"),
    APPROVED("승인"),
    CANCELED("취소"),
    COMPLETED("완료");

    private final String description;

    ScheduleStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    // 문자열을 ScheduleStatus로 변환하는 메서드
    public static ScheduleStatus from(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return ScheduleStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_STATUS);
        }
    }
}
