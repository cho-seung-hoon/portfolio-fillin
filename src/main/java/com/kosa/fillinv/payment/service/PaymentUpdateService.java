package com.kosa.fillinv.payment.service;

import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.payment.entity.Payment;
import com.kosa.fillinv.payment.entity.PaymentHistory;
import com.kosa.fillinv.payment.entity.PaymentStatus;
import com.kosa.fillinv.payment.repository.PaymentHistoryRepository;
import com.kosa.fillinv.payment.repository.PaymentRepository;
import com.kosa.fillinv.payment.service.dto.PaymentStatusUpdateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentUpdateService {

    private final PaymentRepository paymentRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;

    private static PaymentHistory createPaymentHistory(Payment payment, PaymentStatus newStatus, String reason) {
        return PaymentHistory.builder()
                .id(UUID.randomUUID().toString())
                .paymentId(payment.getId())
                .previousStatus(payment.getPaymentStatus())
                .newStatus(newStatus)
                .reason(reason)
                .build();
    }

    @Transactional
    public void updateStatus(PaymentStatusUpdateCommand command) {
        Payment payment = paymentRepository.findByOrderId(command.orderId())
                .orElseThrow(() -> new ResourceException.NotFound("결제 정보 없음"));

        PaymentHistory paymentHistory = createPaymentHistory(
                payment, command.status(), command.failure() == null ? null : command.failure().toString());
        paymentHistoryRepository.save(paymentHistory);

        payment.updateStatus(command.status());
    }
}
