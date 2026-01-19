
import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Calendar } from "lucide-react";
import { CalendarModule } from "./CalendarModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useOneDayRegistrationStore, AvailableTime } from "../../../store/useOneDayRegistrationStore";

export function OneDayClassSection() {
    // Store State & Actions
    const {
        availableTimeList,
        addAvailableTime,
        removeAvailableTime
    } = useOneDayRegistrationStore();

    // Local UI State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [newSessionStartTime, setNewSessionStartTime] = useState("");
    const [newSessionEndTime, setNewSessionEndTime] = useState("");
    const [newSessionPrice, setNewSessionPrice] = useState("");
    const [newSessionSeats, setNewSessionSeats] = useState("");

    // Helper functions
    const getDateFromISO = (isoString: string) => {
        return format(new Date(isoString), "yyyy-MM-dd");
    };

    const getSessionsForDate = (dateKey: string) => {
        return availableTimeList.filter((s) => getDateFromISO(s.startTime) === dateKey);
    };

    // Formatting for display
    const formatTimeRange = (startTime: string, endTime: string) => {
        // e.g. "UTC string" -> "14:00"
        // We assume local processing
        const start = format(new Date(startTime), "HH:mm");
        const end = format(new Date(endTime), "HH:mm");
        return `${start}-${end}`;
    };

    const addSession = () => {
        if (!selectedDate || !newSessionStartTime || !newSessionEndTime || !newSessionPrice || !newSessionSeats) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const price = Number(newSessionPrice);
        const seats = Number(newSessionSeats);

        if (isNaN(price) || price < 0 || isNaN(seats) || seats < 1) {
            alert("가격과 인원을 올바르게 입력해주세요.");
            return;
        }

        const dateStr = format(selectedDate, "yyyy-MM-dd");
        // Convert local input to ISO (UTC)
        const startDateTime = new Date(`${dateStr}T${newSessionStartTime}:00`).toISOString();
        const endDateTime = new Date(`${dateStr}T${newSessionEndTime}:00`).toISOString();

        const newSession: AvailableTime = {
            startTime: startDateTime,
            endTime: endDateTime,
            price,
            seats,
        };

        addAvailableTime(newSession);

        // Reset inputs
        setNewSessionStartTime("");
        setNewSessionEndTime("");
        setNewSessionPrice("");
        setNewSessionSeats("");
    };

    const handleRemoveSession = (targetSession: AvailableTime) => {
        const index = availableTimeList.indexOf(targetSession);
        if (index !== -1) {
            removeAvailableTime(index);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    상세 설정 (원데이 클래스)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">

                    <h4 className="font-medium">일정 선택</h4>

                    <CalendarModule
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        renderDateContent={(date) => {
                            const dateKey = format(date, "yyyy-MM-dd");
                            const dateSessions = getSessionsForDate(dateKey);
                            if (dateSessions.length === 0) return null;
                            return (
                                <div className="space-y-1">
                                    {dateSessions.slice(0, 2).map((session, idx) => (
                                        <div
                                            key={idx}
                                            className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                        >
                                            {formatTimeRange(session.startTime, session.endTime)}
                                        </div>
                                    ))}
                                    {dateSessions.length > 2 && (
                                        <div className="text-xs text-gray-500 px-2">
                                            +{dateSessions.length - 2}개
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />

                    {selectedDate && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium mb-3">
                                    {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 클래스 추가
                                </h4>

                                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                                    <div className="space-y-2">
                                        <Label className="text-sm">시작 시간</Label>
                                        <Input
                                            type="time"
                                            value={newSessionStartTime}
                                            onChange={(e) => setNewSessionStartTime(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">종료 시간</Label>
                                        <Input
                                            type="time"
                                            value={newSessionEndTime}
                                            onChange={(e) => setNewSessionEndTime(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">가격 (원)</Label>
                                        <Input
                                            type="number"
                                            value={newSessionPrice}
                                            onChange={(e) => setNewSessionPrice(e.target.value)}
                                            placeholder="50000"
                                            min="0"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">모집 인원</Label>
                                        <Input
                                            type="number"
                                            value={newSessionSeats}
                                            onChange={(e) => setNewSessionSeats(e.target.value)}
                                            placeholder="10"
                                            min="1"
                                            className="bg-white"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addSession}
                                        className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                                    >
                                        <Plus className="size-4" />
                                        추가
                                    </Button>
                                </div>
                            </div>

                            {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium">등록된 클래스</h5>
                                        <span className="text-sm text-gray-500">
                                            총 {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length}개
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).map((session, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">
                                                        {formatTimeRange(session.startTime, session.endTime)}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                                        {session.price.toLocaleString()}원 / {session.seats}명
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveSession(session)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Simple summary for OneDay Class */}
                    {availableTimeList.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">전체 클래스 요약</h5>
                            <p className="text-sm text-blue-700">
                                총 {availableTimeList.length}개의 클래스가 등록되었습니다
                            </p>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}
