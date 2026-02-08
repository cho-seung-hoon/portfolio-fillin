package com.kosa.fillinv.payment.domain;

import lombok.Getter;

@Getter
public enum PSPConfirmationStatus {
    DONE("완료"),
    CANCELED("승인된 결제가 취소된 상태"),
    EXPIRED("결제 유효시간이 지나서 만료된 상태"),
    PARTIAL_CANCELED("승된 결제가 부분 취소된 상태"),
    ABORTED("경제 승인이 실패된 상태"),
    WAITING_FOR_DEPOSIT("가상계좌 경제 흐름에만 있는 상태로, 결제 고객이 발급된 가상 계좌에 입금하는 것을 기다리는 상태"),
    IN_PROGRESS("결제수단 정보와 해당 결제수단의 소유자가 맞는지 인증을 마친 상태"),
    READY("결제를 생성하면 가지게 되는 초기 상태");

    private final String description;

    PSPConfirmationStatus(String description) {
        this.description = description;
    }

    public static PSPConfirmationStatus get(String status) {
        try {
            return PSPConfirmationStatus.valueOf(status);
        } catch (Exception e) {
            throw new RuntimeException(String.format("PSP 승인상태 (status: %s)는 올바르지 않은 상태입니다.", status));
        }
    }
}
