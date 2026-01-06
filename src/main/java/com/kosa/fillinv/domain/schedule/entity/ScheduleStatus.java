package com.kosa.fillinv.domain.schedule.entity;

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
}
