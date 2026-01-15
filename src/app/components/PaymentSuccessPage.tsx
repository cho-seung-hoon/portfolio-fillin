import { useEffect, useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import client from "../../api/client";

export function PaymentSuccessPage() {
    // @ts-ignore - Search params are not typed in route definition yet
    const search = useSearch({ strict: false });
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");
    const [message, setMessage] = useState("결제 처리 중입니다...");

    useEffect(() => {
        const paymentKey = (search as any).paymentKey;
        const orderId = (search as any).orderId;
        const amount = (search as any).amount;

        if (!paymentKey || !orderId || !amount) {
            setStatus("fail");
            setMessage("결제 정보가 올바르지 않습니다.");
            return;
        }

        // 결제 승인 요청 (axios client 사용)
        client.post("/v1/payments/confirm", {
            paymentKey,
            scheduleId: orderId, // 서버 규격에 맞춰 orderId를 scheduleId로 전달
            amount: Number(amount), // 숫자로 변환하여 전송
        })
            .then(() => {
                setStatus("success");
            })
            .catch((error) => {
                console.error(error);
                setStatus("fail");
                setMessage(error.response?.data?.message || "결제 승인 처리에 실패했습니다.");
            });
    }, [search]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                {status === "loading" && (
                    <div className="space-y-4">
                        <div className="animate-spin w-12 h-12 border-4 border-[#00C471] border-t-transparent rounded-full mx-auto"></div>
                        <h2 className="text-xl font-bold text-gray-900">{message}</h2>
                        <p className="text-gray-500">잠시만 기다려주세요.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-[#E6F9F2] rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-[#00C471]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h2>
                            <p className="text-gray-600">주문이 성공적으로 처리되었습니다.</p>
                        </div>
                        <Button
                            className="w-full bg-[#00C471] hover:bg-[#00B366] text-white py-6 text-lg"
                            onClick={() => navigate({ to: "/" })}
                        >
                            홈으로 돌아가기
                        </Button>
                    </div>
                )}

                {status === "fail" && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h2>
                            <p className="text-gray-600">{message}</p>
                        </div>
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full py-6 text-lg"
                                onClick={() => window.history.back()}
                            >
                                다시 시도하기
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-gray-500"
                                onClick={() => navigate({ to: "/" })}
                            >
                                홈으로 돌아가기
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
