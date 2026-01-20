package com.kosa.fillinv.payment.controller.dto;

import com.kosa.fillinv.payment.domain.PaymentFailure;
import com.kosa.fillinv.payment.entity.PaymentStatus;

public record PaymentConfirmResponse(
        PaymentStatus status,
        PaymentFailure failure
) {
}
