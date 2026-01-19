package com.kosa.fillinv.payment.domain;

import java.time.Instant;

public record PaymentExtraDetails(
        PaymentType type,
        PaymentMethod method,
        Instant approvedAt,
        String orderName,
        PSPConfirmationStatus pspConfirmationStatus,
        Long totalAmount,
        String pspRawData
) {
}
