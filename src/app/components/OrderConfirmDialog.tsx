import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar, Clock } from "lucide-react";

interface OrderConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    service: any;
    selectedOption: any;
    selectedSlot: any;
    selectedDate: Date | null;
    totalPrice: number;
}

export function OrderConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    service,
    selectedOption,
    selectedSlot,
    selectedDate,
    totalPrice,
}: OrderConfirmDialogProps) {
    const renderSchedule = () => {
        if (service.serviceType === "mentoring") {
            if (!selectedDate || !selectedSlot) return "-";
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{format(selectedDate, "yy년 M월 d일 (EEE)", { locale: ko })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{selectedSlot}</span>
                    </div>
                </div>
            );
        }

        if (service.serviceType === "oneday" && selectedSlot) {
            const [year, month, day] = selectedSlot.date.split("-").map(Number);
            const dateObj = new Date(year, month - 1, day);
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{format(dateObj, "yy년 M월 d일 (EEE)", { locale: ko })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{selectedSlot.time}</span>
                    </div>
                </div>
            );
        }

        if (service.serviceType === "study") {
            return (
                <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{service.schedules?.["1-n-study"]?.duration || "일정 확인 요망"}</span>
                </div>
            );
        }

        return "-";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">주문 정보 확인</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">서비스 정보</h3>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={service.thumbnail}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-[#00C471] font-medium">
                                        {service.serviceType === "mentoring" ? "1:1 멘토링" : service.serviceType === "oneday" ? "원데이 클래스" : "스터디"}
                                    </p>
                                    <h4 className="font-bold text-gray-900 line-clamp-2">{service.title}</h4>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">선택 옵션</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedOption?.name || service.title}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">예약 일정</p>
                                    <div className="text-sm font-medium">
                                        {renderSchedule()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">결제 금액</h3>
                        <div className="bg-[#E6F9F2] p-4 rounded-xl flex items-center justify-between border border-[#00C471]/20">
                            <span className="text-gray-700 font-medium">총 결제금액</span>
                            <span className="text-xl font-bold text-[#00C471]">₩{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                        <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                            <li>선택하신 상품 및 일정이 정확한지 다시 한번 확인해 주세요.</li>
                            <li>결제 완료 후 즉시 예약이 진행됩니다.</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex gap-3 sm:gap-0">
                    <Button
                        variant="outline"
                        className="flex-1 py-6 text-base font-medium"
                        onClick={() => onOpenChange(false)}
                    >
                        취소
                    </Button>
                    <Button
                        className="flex-1 bg-[#00C471] hover:bg-[#00B366] text-white py-6 text-base font-medium shadow-lg shadow-[#00C471]/20"
                        onClick={onConfirm}
                    >
                        결제하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
