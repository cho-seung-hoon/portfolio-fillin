import { useEffect, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    price: number;
    orderName: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
}

export function PaymentDialog({
    open,
    onOpenChange,
    price,
    orderName,
    orderId,
    customerName,
    customerEmail,
}: PaymentDialogProps) {
    const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
    const [paymentMethodWidget, setPaymentMethodWidget] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
    const customerKey = "test_customer_key_1234"; // Random or User specific key

    useEffect(() => {
        if (open) {
            (async () => {
                setIsLoading(true);
                try {
                    const widget = await loadPaymentWidget(clientKey, customerKey);
                    setPaymentWidget(widget);
                } catch (error) {
                    console.error("Failed to load payment widget:", error);
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [open]);

    useEffect(() => {
        if (paymentWidget && open) {
            const paymentMethods = paymentWidget.renderPaymentMethods(
                "#payment-method",
                { value: price },
                { variantKey: "DEFAULT" }
            );
            setPaymentMethodWidget(paymentMethods);

            paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
        }
    }, [paymentWidget, open]);

    // Handle price updates separately to prevent re-rendering the whole widget
    useEffect(() => {
        if (paymentMethodWidget) {
            paymentMethodWidget.updateAmount(price);
        }
    }, [price, paymentMethodWidget]);

    const handleRequestPayment = async () => {
        try {
            if (!paymentWidget) return;
            await paymentWidget.requestPayment({
                orderId: orderId,
                orderName: orderName,
                successUrl: window.location.origin + "/success",
                failUrl: window.location.origin + "/fail",
                customerEmail: customerEmail,
                customerName: customerName,
            });
        } catch (error) {
            console.error("Payment request failed:", error);
            alert("결제 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>결제하기</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div id="payment-method"></div>
                    <div id="agreement"></div>
                    <div className="px-6 mt-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="coupon-box"
                                className="w-4 h-4 text-[#00C471] border-gray-300 rounded focus:ring-[#00C471]"
                                onChange={(e) => {
                                    if (paymentMethodWidget) {
                                        paymentMethodWidget.updateAmount(e.target.checked ? price - 5000 : price);
                                    }
                                }}
                            />
                            <label htmlFor="coupon-box" className="text-sm font-medium text-gray-700">5,000원 쿠폰 적용</label>
                        </div>
                    </div>
                    <div className="px-6 mt-6">
                        <Button
                            className="w-full bg-[#00C471] hover:bg-[#00B366] text-white py-6 text-lg font-medium"
                            onClick={handleRequestPayment}
                            disabled={isLoading || !paymentWidget}
                        >
                            {isLoading ? "로딩 중..." : "결제하기"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
