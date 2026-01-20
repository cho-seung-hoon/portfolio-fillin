package com.kosa.fillinv.payment.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentHistory extends BaseEntity {

    @Id
    @Column(name = "payment_history_id")
    private String id;

    @Column(name = "payment_id")
    private String paymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private PaymentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    private PaymentStatus newStatus;

    @Column(name = "reason")
    private String reason;

    @Builder
    public PaymentHistory(
            String id,
            String paymentId,
            PaymentStatus previousStatus,
            PaymentStatus newStatus,
            String reason) {
        this.id = id;
        this.paymentId = paymentId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
    }

}
