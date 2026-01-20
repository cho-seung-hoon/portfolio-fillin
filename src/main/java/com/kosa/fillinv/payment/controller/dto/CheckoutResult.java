package com.kosa.fillinv.payment.controller.dto;

public record CheckoutResult(
        String orderId,
        String orderName,
        Integer amount
) {
}
