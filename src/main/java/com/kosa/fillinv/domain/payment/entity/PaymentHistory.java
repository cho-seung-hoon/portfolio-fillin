package com.kosa.fillinv.domain.payment.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_history")
public class PaymentHistory {

    @Id
    @Column(name = "payment_history_id", nullable = false)
    private Long id;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    @Column(name = "use_point", nullable = false)
    private Integer usePoint;

    @Column(name = "final_price", nullable = false)
    private Integer finalPrice;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PaymentHistoryType type; // 결제, 전체환불, 부분환불

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "schedule_id", nullable = false)
    private String scheduleId;
}
