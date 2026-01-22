
import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Calendar, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { CalendarModule } from "./CalendarModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { TimePicker } from "../ui/time-picker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useOneDayRegistrationStore, AvailableTime } from "../../../store/useOneDayRegistrationStore";

export function OneDayClassSection() {
    // Store State & Actions
    const {
        availableTimeList,
        addAvailableTime,
        removeAvailableTime
    } = useOneDayRegistrationStore();

    // Local UI State for adding new session
    const [newSessionDate, setNewSessionDate] = useState<Date | undefined>(undefined);
    const [newSessionStartTime, setNewSessionStartTime] = useState("09:00");
    const [newSessionEndTime, setNewSessionEndTime] = useState("10:00");
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
        // TimePicker의 기본값이 "09:00"이므로 빈 문자열이 아닌지 확인
        const hasStartTime = newSessionStartTime && newSessionStartTime.trim() !== "";
        const hasEndTime = newSessionEndTime && newSessionEndTime.trim() !== "";

        if (!newSessionDate || !hasStartTime || !hasEndTime || !newSessionPrice || !newSessionSeats) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const price = Number(newSessionPrice);
        const seats = Number(newSessionSeats);

        if (isNaN(price) || price < 0 || isNaN(seats) || seats < 1) {
            alert("가격과 인원을 올바르게 입력해주세요.");
            return;
        }

        const dateStr = format(newSessionDate, "yyyy-MM-dd");
        // Convert local input to ISO (UTC)
        const startDateTime = new Date(`${dateStr}T${newSessionStartTime}:00`).toISOString();
        const endDateTime = new Date(`${dateStr}T${newSessionEndTime}:00`).toISOString();

        // Validate that end time is after start time
        if (new Date(endDateTime) <= new Date(startDateTime)) {
            alert("종료 시간은 시작 시간보다 늦어야 합니다.");
            return;
        }

        const newSession: AvailableTime = {
            startTime: startDateTime,
            endTime: endDateTime,
            price,
            seats,
        };

        addAvailableTime(newSession);

        // Reset inputs (회차 추가 후 등록 단계 안내 초기화)
        setNewSessionDate(undefined);
        setNewSessionStartTime("09:00");
        setNewSessionEndTime("10:00");
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
                    {/* 진행 단계 안내 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <h4 className="font-medium text-blue-900">등록 단계 안내</h4>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <div className="flex items-center gap-2">
                                        {newSessionDate ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={newSessionDate ? "line-through text-gray-500" : ""}>
                                            1단계: 날짜 선택
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {availableTimeList.length > 0 ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={availableTimeList.length > 0 ? "line-through text-gray-500" : ""}>
                                            2단계: 시간 설정 (시작/종료)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(newSessionPrice && newSessionSeats) ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={(newSessionPrice && newSessionSeats) ? "line-through text-gray-500" : ""}>
                                            3단계: 가격 및 모집 인원 입력
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {availableTimeList.length > 0 ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={availableTimeList.length > 0 ? "line-through text-gray-500" : ""}>
                                            4단계: 회차 추가 완료
                                        </span>
                                    </div>
                                </div>
                                {availableTimeList.length === 0 && (
                                    <Alert className="mt-3 bg-white border-blue-300">
                                        <AlertCircle className="size-4 text-blue-600" />
                                        <AlertTitle className="text-blue-900">시작하기</AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            아래 폼에서 첫 번째 회차를 추가해주세요. 날짜를 선택하고 시간, 가격, 인원을 입력한 후 "회차 추가" 버튼을 클릭하세요.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 회차 추가 폼 */}
                    <div className="bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">회차 추가</h4>
                            {availableTimeList.length > 0 && (
                                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                    등록된 회차: {availableTimeList.length}개
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">날짜</Label>
                                <Input
                                    type="date"
                                    value={newSessionDate ? format(newSessionDate, "yyyy-MM-dd") : ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setNewSessionDate(new Date(e.target.value));
                                        } else {
                                            setNewSessionDate(undefined);
                                        }
                                    }}
                                    className="bg-white"
                                />
                            </div>
                            <TimePicker
                                value={newSessionStartTime}
                                onChange={setNewSessionStartTime}
                                label="시작 시간"
                            />
                            <TimePicker
                                value={newSessionEndTime}
                                onChange={setNewSessionEndTime}
                                label="종료 시간"
                            />
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
                                <Label className="text-sm">
                                    모집 인원 (명) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    value={newSessionSeats}
                                    onChange={(e) => setNewSessionSeats(e.target.value)}
                                    placeholder="10"
                                    min="1"
                                    className="bg-white"
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={addSession}
                            className="mt-4 w-full bg-[#00C471] hover:bg-[#00B366] gap-2"
                            disabled={!newSessionDate || !newSessionStartTime?.trim() || !newSessionEndTime?.trim() || !newSessionPrice || !newSessionSeats}
                        >
                            <Plus className="size-4" />
                            회차 추가
                        </Button>
                        {(!newSessionDate || !newSessionStartTime?.trim() || !newSessionEndTime?.trim() || !newSessionPrice || !newSessionSeats) && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                모든 필드를 입력해주세요
                            </p>
                        )}
                    </div>

                    {/* 등록된 회차 목록 */}
                    {availableTimeList.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">등록된 회차</h4>
                                <span className="text-sm text-gray-500">
                                    총 {availableTimeList.length}개
                                </span>
                            </div>
                            <div className="space-y-2">
                                {availableTimeList.map((session, idx) => {
                                    const sessionDate = new Date(session.startTime);
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {format(sessionDate, "yyyy년 M월 d일 (EEE)", { locale: ko })}
                                                    </span>
                                                    <span className="text-sm text-gray-600 mt-1">
                                                        {formatTimeRange(session.startTime, session.endTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded">
                                                        {session.price.toLocaleString()}원
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded">
                                                        {session.seats}명
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveSession(session)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 달력 미리보기 */}
                    {availableTimeList.length > 0 && (
                        <div className="border-t pt-6">
                            <h4 className="font-medium mb-4">일정 달력</h4>
                            <CalendarModule
                                selectedDate={undefined}
                                onDateSelect={() => { }}
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
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
