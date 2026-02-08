package com.kosa.fillinv.payment.domain;

import lombok.Getter;

@Getter
public enum PaymentType {
    NORMAL("일반결제");

    private String description;

    PaymentType(String description) {
        this.description = description;
    }

    public static PaymentType get(String type) {
        try {
            return PaymentType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(String.format("PaymentType (type: %s)은 올바르지 않은 결제 타입입니다.", type));
        }

    }

    public String getDescription() {
        return description;
    }
}
