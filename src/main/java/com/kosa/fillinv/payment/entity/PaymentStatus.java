package com.kosa.fillinv.payment.entity;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    NOT_STARTED("결제 승인 시작 전"),
    EXECUTING("결게 승인 중"),
    SUCCESS("결제 승인 성공"),
    FAILURE("결제 승인 실패"),
    UNKNOWN("결제 승인 결과 알 수 없는 상태");

    private String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public static PaymentStatus fromName(String name) {
        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.name().equals(name)) {
                return status;
            }
        }
        throw new IllegalArgumentException("PaymentStatus: " + name + "는 올바르지 않은 결제 타입입니다.");
    }

    public String getDescription() {
        return description;
    }
}
