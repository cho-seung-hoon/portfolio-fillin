package com.kosa.fillinv.payment.service.dto;

public record PaymentConfirmCommand(
        String paymentKey,
        String orderId,
        Integer amount
) {
}
