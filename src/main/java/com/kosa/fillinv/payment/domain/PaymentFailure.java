package com.kosa.fillinv.payment.domain;

public record PaymentFailure(
        String errorCode,
        String message
) {
}