package com.kosa.fillinv.payment.client.dto;

public record TossPaymentConfirmRequest(
        String paymentKey,
        String orderId,
        Integer amount
) {
}
