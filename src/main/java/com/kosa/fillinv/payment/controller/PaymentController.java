package com.kosa.fillinv.payment.controller;

import com.kosa.fillinv.payment.controller.dto.CheckoutCommand;
import com.kosa.fillinv.payment.controller.dto.CheckoutResult;
import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.payment.client.dto.TossPaymentConfirmRequest;
import com.kosa.fillinv.payment.service.PaymentService;
import com.kosa.fillinv.payment.service.dto.PaymentConfirmCommand;
import com.kosa.fillinv.payment.service.dto.PaymentConfirmResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    // 결제에 필요한 데이터를 반환, 결제 테이블에 데이터를 삽입, 결제 프로세스의 시작
    @PostMapping("/checkout")
    public SuccessResponse<CheckoutResult> checkout(
            @RequestBody CheckoutCommand request
    ) {
        CheckoutResult checkout = paymentService.checkout(request);

        return SuccessResponse.success(HttpStatus.OK, checkout);
    }

    //  client가 TOSS에서 받은 paymentKey로 서버에서 TOSS에 확인
    @PostMapping("/confirm")
    public SuccessResponse<PaymentConfirmResult> confirm(
            @RequestBody TossPaymentConfirmRequest request
    ) {
        PaymentConfirmResult confirm = paymentService.confirm(new PaymentConfirmCommand(request.paymentKey(), request.orderId(), request.amount()));

        return SuccessResponse.success(HttpStatus.OK, confirm);
    }
}
