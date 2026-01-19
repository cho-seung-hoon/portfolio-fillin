package com.kosa.fillinv.payment.service.dto;

import com.kosa.fillinv.payment.domain.PaymentFailure;
import com.kosa.fillinv.payment.entity.PaymentStatus;

public record PaymentConfirmResult(
        PaymentStatus status,
        PaymentFailure failure
) {
}
