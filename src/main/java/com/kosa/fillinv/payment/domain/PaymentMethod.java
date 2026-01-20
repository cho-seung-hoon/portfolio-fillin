package com.kosa.fillinv.payment.domain;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    EASY_PAY("간편결제");

    private String method;

    PaymentMethod(String method) {
        this.method = method;
    }

    public static PaymentMethod get(String method) {
        for (PaymentMethod paymentMethod : PaymentMethod.values()) {
            if (paymentMethod.getMethod().equals(method)) {
                return paymentMethod;
            }
        }
        throw new RuntimeException(String.format("PaymentMethod (method: %s)는 올바르지 않은 결제 방법입니다.", method));
    }

    public String getMethod() {
        return method;
    }
}
