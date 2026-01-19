package com.kosa.fillinv.payment.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosa.fillinv.payment.client.dto.*;
import com.kosa.fillinv.payment.client.dto.TossPaymentConfirmRequest;
import com.kosa.fillinv.payment.domain.*;
import com.kosa.fillinv.payment.service.dto.PaymentConfirmCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.InputStream;

@Component
@RequiredArgsConstructor
public class TossPaymentClient {

    private final RestClient tossRestClient;
    private final ObjectMapper objectMapper;

    private final String uri = "/v1/payments/confirm";
    private static final int MAX_RETRY_COUNT = 2;

    public PaymentExecutionResult confirm(PaymentConfirmCommand command) {
        int attempt = 0;

        while (true) {
            try {
                TossPaymentConfirmationResponse response =
                        tossRestClient.post()
                                .uri(uri)
                                .header("Idempotency-Key", command.orderId())
                                .body(new TossPaymentConfirmRequest(
                                        command.paymentKey(),
                                        command.orderId(),
                                        command.amount()
                                ))
                                .retrieve()
                                .onStatus(
                                        status -> status.is4xxClientError() || status.is5xxServerError(),
                                        (req, res) -> {
                                            try (InputStream is = res.getBody()) {
                                                TossPaymentConfirmationResponse.TossFailureResponse errorResponse =
                                                        objectMapper.readValue(is, TossPaymentConfirmationResponse.TossFailureResponse.class);

                                                TossPaymentError tossPaymentError = TossPaymentError.get(errorResponse.code());

                                                throw PSPConfirmationException.builder()
                                                        .errorCode(tossPaymentError.getStatusCode().toString())
                                                        .errorMessage(tossPaymentError.getDescription())
                                                        .isSuccess(tossPaymentError.isSuccess())
                                                        .isFailure(tossPaymentError.isFailure())
                                                        .isUnknown(tossPaymentError.isUnknown())
                                                        .isRetryable(tossPaymentError.isRetryable())
                                                        .build();

                                            } catch (IOException e) {
                                                throw new RuntimeException("에러 응답 파싱 실패", e);
                                            }
                                        }
                                )
                                .body(TossPaymentConfirmationResponse.class);

                return new PaymentExecutionResult(
                        response.paymentKey(),
                        response.orderId(),
                        new PaymentExtraDetails(
                                PaymentType.get(response.type().name()),
                                PaymentMethod.get(response.method()),
                                response.approvedAt().toInstant(),
                                response.orderName(),
                                PSPConfirmationStatus.get(response.status().name()),
                                response.totalAmount().longValue(),
                                response.toString()
                        )
                );

            } catch (PSPConfirmationException e) {
                attempt++;

                if (!e.isRetryable() || attempt > MAX_RETRY_COUNT) {
                    throw e;
                }

                backoff(attempt);

            } catch (ResourceAccessException e) { // timeout / network
                attempt++;

                if (attempt > MAX_RETRY_COUNT) {
                    throw e;
                }

                backoff(attempt);
            }
        }
    }

    private void backoff(int attempt) {
        try {
            long delayMillis = (long) (1000L * Math.pow(2, attempt));
            Thread.sleep(delayMillis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(ie);
        }
    }
}
