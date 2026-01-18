package com.kosa.fillinv.payment.domain;

public record PaymentExecutionResult(
        String paymentKey,
        String orderId,
        PaymentExtraDetails paymentExtraDetails
) {
}
