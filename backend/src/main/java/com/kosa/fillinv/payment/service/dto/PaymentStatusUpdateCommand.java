package com.kosa.fillinv.payment.service.dto;

import com.kosa.fillinv.payment.domain.PaymentExtraDetails;
import com.kosa.fillinv.payment.domain.PaymentFailure;
import com.kosa.fillinv.payment.entity.PaymentStatus;

public record PaymentStatusUpdateCommand(
        String paymentKey,
        String orderId,
        PaymentStatus status,
        PaymentExtraDetails extraDetails,
        PaymentFailure failure
) {
}
