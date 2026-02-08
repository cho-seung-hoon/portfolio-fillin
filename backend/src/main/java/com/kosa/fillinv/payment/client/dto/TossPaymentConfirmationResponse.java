package com.kosa.fillinv.payment.client.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TossPaymentConfirmationResponse(
        String version,
        String paymentKey,
        Type type,
        String orderId,
        String orderName,
        String mId,
        String currency,
        String method,

        BigDecimal totalAmount,
        BigDecimal balanceAmount,
        Status status,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime requestedAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime approvedAt,

        boolean useEscrow,
        String lastTransactionKey,

        BigDecimal suppliedAmount,
        BigDecimal vat,
        boolean cultureExpense,
        BigDecimal taxFreeAmount,
        Integer taxExemptionAmount,

        List<Cancel> cancels,

        Card card,
        VirtualAccount virtualAccount,
        MobilePhone mobilePhone,
        GiftCertificate giftCertificate,
        Transfer transfer,

        Map<String, String> metadata,
        Receipt receipt,
        Checkout checkout,

        EasyPay easyPay,
        String country,
        TossFailureResponse tossFailureResponse,

        CashReceipt cashReceipt,
        List<CashReceiptRecord> cashReceipts
) {
    // ===== Enums =====
    public enum Type {NORMAL, BILLING, BRANDPAY}

    public enum Status {
        READY, IN_PROGRESS, WAITING_FOR_DEPOSIT, DONE,
        CANCELED, PARTIAL_CANCELED, ABORTED, EXPIRED
    }

    public enum AcquireStatus {READY, REQUESTED, COMPLETED, CANCEL_REQUESTED, CANCELED}

    public enum InterestPayer {BUYER, CARD_COMPANY, MERCHANT}

    public enum RefundStatus {NONE, PENDING, FAILED, PARTIAL_FAILED, COMPLETED}

    public enum SettlementStatus {INCOMPLETED, COMPLETED}

    public enum CancelStatus {DONE}

    // ===== Nested Records =====

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Cancel(
            BigDecimal cancelAmount,
            String cancelReason,
            BigDecimal taxFreeAmount,
            Integer taxExemptionAmount,
            BigDecimal refundableAmount,
            BigDecimal cardDiscountAmount,
            BigDecimal transferDiscountAmount,
            BigDecimal easyPayDiscountAmount,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
            OffsetDateTime canceledAt,
            String transactionKey,
            String receiptKey,
            CancelStatus cancelStatus,
            String cancelRequestId
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Card(
            BigDecimal amount,
            String issuerCode,
            String acquirerCode,
            String number,
            Integer installmentPlanMonths,
            String approveNo,
            boolean useCardPoint,
            String cardType,
            String ownerType,
            AcquireStatus acquireStatus,
            @JsonProperty("isInterestFree")
            boolean interestFree,
            InterestPayer interestPayer
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VirtualAccount(
            String accountType,
            String accountNumber,
            String bankCode,
            String customerName,
            String depositorName,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
            OffsetDateTime dueDate,
            RefundStatus refundStatus,
            boolean expired,
            SettlementStatus settlementStatus,
            RefundReceiveAccount refundReceiveAccount
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RefundReceiveAccount(
            String bankCode,
            String accountNumber,
            @JsonProperty("holderName")
            String holderName
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MobilePhone(
            String customerMobilePhone,
            SettlementStatus settlementStatus,
            String receiptUrl
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GiftCertificate(
            String approveNo,
            SettlementStatus settlementStatus
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Transfer(
            String bankCode,
            SettlementStatus settlementStatus
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Receipt(
            String url
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Checkout(
            String url
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EasyPay(
            String provider,
            BigDecimal amount,
            BigDecimal discountAmount
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TossFailureResponse(
            String code,
            String message
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CashReceipt(
            String type,
            String receiptKey,
            String issueNumber,
            String receiptUrl,
            BigDecimal amount,
            BigDecimal taxFreeAmount
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CashReceiptRecord(
            String receiptKey,
            String orderId,
            String orderName,
            String type,
            String issueNumber,
            String receiptUrl,
            String businessNumber,
            String transactionType,
            Integer amount,
            Integer taxFreeAmount,
            String issueStatus,
            TossFailureResponse tossFailureResponse,
            String customerIdentityNumber,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
            OffsetDateTime requestedAt
    ) {
    }
}