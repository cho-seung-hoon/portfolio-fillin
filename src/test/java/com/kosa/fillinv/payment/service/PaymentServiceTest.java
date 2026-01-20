package com.kosa.fillinv.payment.service;

import com.kosa.fillinv.payment.client.TossPaymentClient;
import com.kosa.fillinv.payment.controller.dto.CheckoutCommand;
import com.kosa.fillinv.payment.controller.dto.CheckoutResult;
import com.kosa.fillinv.payment.domain.*;
import com.kosa.fillinv.payment.entity.Payment;
import com.kosa.fillinv.payment.entity.PaymentHistory;
import com.kosa.fillinv.payment.entity.PaymentStatus;
import com.kosa.fillinv.payment.repository.PaymentHistoryRepository;
import com.kosa.fillinv.payment.repository.PaymentRepository;
import com.kosa.fillinv.payment.service.dto.PaymentConfirmCommand;
import com.kosa.fillinv.payment.service.dto.PaymentConfirmResult;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.entity.ScheduleTime;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@SpringBootTest
@Transactional
@ActiveProfiles("local")
class PaymentServiceTest {

    @MockitoBean
    private ScheduleRepository scheduleRepository;

    @MockitoBean
    private TossPaymentClient tossPaymentClient;

    @Autowired
    private PaymentService paymentService;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PaymentHistoryRepository paymentHistoryRepository;

    @Autowired
    private EntityManager entityManager;

    private static PaymentExecutionResult createSuccessResult(String paymentKey, CheckoutResult checkout) {
        PaymentExtraDetails paymentExtraDetails = new PaymentExtraDetails(
                PaymentType.NORMAL,
                PaymentMethod.EASY_PAY,
                Instant.now(),
                checkout.orderName(),
                PSPConfirmationStatus.DONE,
                (long) checkout.amount(),
                ""
        );

        return new PaymentExecutionResult(
                paymentKey,
                checkout.orderId(),
                paymentExtraDetails
        );
    }

    private static PSPConfirmationException createFailException() {
        return new PSPConfirmationException(
                "404", "Not Found", false, true, false, false
        );
    }

    @Test
    @DisplayName("결제 시도 시 Payment가 생성된다")
    void checkout() {
        // given
        String scheduleId = "dummyScheduleId";
        Schedule schedule = createMentoringSchedule(scheduleId);

        given(scheduleRepository.findById(scheduleId))
                .willReturn(Optional.of(schedule));

        // when
        CheckoutResult checkout = paymentService.checkout(new CheckoutCommand(scheduleId));
        entityManager.flush();
        entityManager.clear();

        // then
        Payment payment = paymentRepository.findByOrderId(scheduleId).orElseThrow();
        assertThat(payment).isNotNull();
        assertThat(payment.getAmount()).isEqualTo(schedule.getPrice());
        assertThat(payment.getOrderId()).isEqualTo(scheduleId);
        assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.NOT_STARTED);
        assertThat(payment.getBuyerId()).isEqualTo(schedule.getMenteeId());
        assertThat(payment.getSellerId()).isEqualTo(schedule.getMentorId());

        assertThat(checkout.orderId()).isEqualTo(payment.getOrderId());
        assertThat(checkout.amount()).isEqualTo(payment.getAmount());
        assertThat(checkout.orderName()).isEqualTo(payment.getOrderName());
        System.out.println(payment.getOrderName());
    }

    /**
     * Toss Confirm Api 요청에 대한 응답이 정상적으로 도착하고
     * 결과가 SUCCESS 인 걍우
     * Payment의 Status는 SUCEESS이며
     * Payment History는 NOT_STARTED -> EXECUTING, EXECUTING -> SUCCESS 가 누적된다.
     **/
    @Test
    @DisplayName("결제 승인 성공 시 Payment 상태가 SUCCESS로 변경되고 History가 기록된다")
    public void confirm() {
        // given
        String scheduleId = "dummyScheduleId";
        Schedule schedule = createMentoringSchedule(scheduleId);

        given(scheduleRepository.findById(scheduleId))
                .willReturn(Optional.of(schedule));

        CheckoutResult checkout = paymentService.checkout(new CheckoutCommand(scheduleId));
        entityManager.flush();
        entityManager.clear();

        String paymentKey = "dummyPaymentKey";
        PaymentConfirmCommand command = new PaymentConfirmCommand(
                paymentKey, checkout.orderId(), checkout.amount()
        );

        given(tossPaymentClient.confirm(command))
                .willReturn(createSuccessResult(paymentKey, checkout));

        // when
        PaymentConfirmResult confirm = paymentService.confirm(command);
        entityManager.flush();
        entityManager.clear();

        // then
        Payment payment = paymentRepository.findByOrderId(checkout.orderId()).orElseThrow();
        List<PaymentHistory> histories = paymentHistoryRepository.findAllByPaymentId(payment.getId());

        assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(histories).hasSize(2);
        assertThat(histories.stream().map(PaymentHistory::getPreviousStatus).toList())
                .contains(PaymentStatus.NOT_STARTED, PaymentStatus.EXECUTING);
        assertThat(histories.stream().map(PaymentHistory::getNewStatus).toList())
                .contains(PaymentStatus.EXECUTING, PaymentStatus.SUCCESS);
    }

    @Test
    @DisplayName("결제 승인 실패 시 Payment 상태가 FAILURE로 변경되고 History가 기록된다")
    void confirmFail() {
        // given
        String scheduleId = "dummyScheduleId";
        Schedule schedule = createMentoringSchedule(scheduleId);

        given(scheduleRepository.findById(scheduleId))
                .willReturn(Optional.of(schedule));

        CheckoutResult checkout = paymentService.checkout(new CheckoutCommand(scheduleId));
        entityManager.flush();
        entityManager.clear();

        String paymentKey = "dummyPaymentKey";
        PaymentConfirmCommand command = new PaymentConfirmCommand(
                paymentKey, checkout.orderId(), checkout.amount()
        );

        given(tossPaymentClient.confirm(command))
                .willThrow(createFailException());

        // when
        PaymentConfirmResult confirm = paymentService.confirm(command);

        // then
        Payment payment = paymentRepository.findByOrderId(checkout.orderId()).orElseThrow();
        List<PaymentHistory> histories = paymentHistoryRepository.findAllByPaymentId(payment.getId());

        assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.FAILURE);
        assertThat(histories).hasSize(2);
        assertThat(histories.stream().map(PaymentHistory::getPreviousStatus).toList())
                .contains(PaymentStatus.NOT_STARTED, PaymentStatus.EXECUTING);
        assertThat(histories.stream().map(PaymentHistory::getNewStatus).toList())
                .contains(PaymentStatus.EXECUTING, PaymentStatus.FAILURE);
    }

    private Schedule createMentoringSchedule(String scheduleId) {
        Schedule schedule = Schedule.builder()
                .id(scheduleId)
                .status(ScheduleStatus.APPROVED)
                .requestContent("멘토링 신청합니다")

                /* Lesson Snapshot */
                .lessonTitle("자바 멘토링")
                .lessonType("MENTORING")
                .lessonDescription("자바 백엔드 멘토링")
                .lessonLocation("ONLINE")
                .lessonCategoryName("개발")
                .mentorNickname("멘토닉")

                /* Option Snapshot */
                .optionName("30분")
                .optionMinute(30)
                .price(30000)

                /* FK */
                .lessonId("lesson-001")
                .menteeId("mentee-001")
                .mentorId("mentor-001")
                .optionId("option-001")
                .availableTimeId(null)
                .scheduleTimeList(new ArrayList<>())
                .build();

        // ScheduleTime 더미 1개 추가
        ScheduleTime scheduleTime = ScheduleTime.of(
                Instant.parse("2025-01-10T10:00:00Z"),
                Instant.parse("2025-01-10T10:30:00Z"),
                schedule
        );

        schedule.addScheduleTime(scheduleTime);

        return schedule;
    }

}