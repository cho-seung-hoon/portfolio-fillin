import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, User, MapPin, FileText, Tag, Clock } from "lucide-react";
import { ScheduleDetailResponse, ScheduleListResponse, ScheduleStatus } from "../../api/types";
import { useState, useEffect } from "react";
import { scheduleService } from "../../api/schedule";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

interface ScheduleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: ScheduleListResponse | null;
    isLoading?: boolean;
    onStatusChange: (status: ScheduleStatus) => void;
    isMentor?: boolean;
}

const statusLabels: Record<string, string> = {
    PAYMENT_PENDING: "결제 대기",
    APPROVAL_PENDING: "승인 대기",
    APPROVED: "승인",
    CANCELED: "취소",
    COMPLETED: "완료",
};

const statusColors: Record<string, string> = {
    PAYMENT_PENDING: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    APPROVAL_PENDING: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    APPROVED: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    CANCELED: "bg-red-100 text-red-700 hover:bg-red-100",
    COMPLETED: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

export function ScheduleDetailModal({
    isOpen,
    onClose,
    schedule,
    isLoading,
    onStatusChange,
    isMentor = false,
}: ScheduleDetailModalProps) {

    const [detail, setDetail] = useState<ScheduleDetailResponse | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    useEffect(() => {
        if (isOpen && schedule) {
            const fetchDetail = async () => {
                setIsDetailLoading(true);
                try {
                    const data = await scheduleService.getScheduleDetail(schedule.scheduleId, schedule.scheduleTimeId);
                    setDetail(data);
                } catch (error) {
                    console.error("Failed to fetch schedule detail:", error);
                } finally {
                    setIsDetailLoading(false);
                }
            };
            fetchDetail();
        } else {
            setDetail(null);
        }
    }, [isOpen, schedule]);

    const displayData = detail || schedule;
    const currentUserRole = detail?.userRole || (isMentor ? "MENTOR" : "MENTEE");
    const isActuallyMentor = currentUserRole === "MENTOR";
    const isActuallyMentee = currentUserRole === "MENTEE";

    const formatDateTime = (isoString?: string) => {
        if (!isoString) return "-";
        return format(new Date(isoString), "yyyy.MM.dd (E) a h:mm", { locale: ko });
    };

    const formatCurrency = (amount?: number) => {
        if (amount === undefined) return "-";
        return amount.toLocaleString() + "원";
    };

    if (!isOpen || (!schedule && !detail)) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">스케줄 상세 정보</DialogTitle>
                </DialogHeader>

                {isLoading || isDetailLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : displayData && (
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className={`${statusColors[displayData.status]} text-base px-3 py-1`}
                            >
                                {statusLabels[displayData.status]}
                            </Badge>
                        </div>

                        {/* Lesson Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">레슨 정보</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">클래스 제목</p>
                                    <p className="font-medium">{displayData.lessonTitle}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">멘토</p>
                                    <p className="font-medium">{displayData.mentorNickname}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">카테고리</p>
                                    <p className="font-medium">{(displayData as any).category || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">레슨 유형</p>
                                    <p className="font-medium">{displayData.lessonType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">장소</p>
                                    <p className="font-medium">{displayData.location}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">레슨 설명</p>
                                    <p className="text-gray-700">{(displayData as any).description || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">예약 정보</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">예약 날짜</p>
                                    <p className="font-medium">{format(new Date(displayData.startTime), "yyyy.MM.dd")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">시간</p>
                                    <p className="font-medium">
                                        {format(new Date(displayData.startTime), "HH:mm")} - {format(new Date(displayData.endTime), "HH:mm")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">멘티</p>
                                    <p className="font-medium">{displayData.menteeNickname}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">옵션명</p>
                                    <p className="font-medium">
                                        {displayData.optionName || "-"}
                                    </p>
                                </div>
                                {((displayData as any).requestContent) && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500 mb-1">요청 사항</p>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{(displayData as any).requestContent}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">금액 정보</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">레슨 금액</p>
                                    <p className="font-semibold text-lg">{formatCurrency((displayData as any).price)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                닫기
                            </Button>

                            {/* Status Change Buttons */}
                            {displayData.status === "APPROVAL_PENDING" && isActuallyMentor && (
                                <>
                                    <Button
                                        className="bg-[#00C471] hover:bg-[#00B366] text-white"
                                        onClick={() => onStatusChange("APPROVED")}
                                    >
                                        승인하기
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                        onClick={() => onStatusChange("CANCELED")}
                                    >
                                        거절하기
                                    </Button>
                                </>
                            )}

                            {displayData.status === "APPROVED" && isActuallyMentee && (
                                <Button
                                    className="bg-[#00C471] hover:bg-[#00B366] text-white"
                                    onClick={() => onStatusChange("COMPLETED")}
                                >
                                    수강 완료
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog >
    );
}
