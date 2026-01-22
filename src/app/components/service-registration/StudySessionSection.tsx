
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Calendar, DollarSign, Users, CalendarIcon, Info, CheckCircle2, ArrowDown, Clock } from "lucide-react";
import { CalendarModule } from "./CalendarModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { TimePicker } from "../ui/time-picker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { useStudyRegistrationStore, AvailableTime } from "../../../store/useStudyRegistrationStore";

export function StudySessionSection() {
    const {
        price,
        seats,
        availableTimeList,
        studyStartDate,
        studyEndDate,
        isRecurring,
        selectedWeekdays,
        setPrice,
        setSeats,
        setStudyStartDate,
        setStudyEndDate,
        setIsRecurring,
        toggleWeekday,
        addAvailableTime,
        removeAvailableTime
    } = useStudyRegistrationStore();

    // Helper function to convert date string to ISO
    const toLocalISOString = (dateStr: string, timeStr: string) => {
        const localDate = new Date(`${dateStr}T${timeStr}`);
        return localDate.toISOString();
    };

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [newSessionStartTime, setNewSessionStartTime] = useState("09:00");
    const [newSessionEndTime, setNewSessionEndTime] = useState("10:00");
    const scheduleSectionRef = useRef<HTMLDivElement>(null);

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    // Check if basic info is complete
    const isBasicInfoComplete = seats > 0 && price > 0 && studyStartDate !== null && studyEndDate !== null;

    // Auto-scroll to schedule section when basic info is complete
    useEffect(() => {
        if (isBasicInfoComplete && availableTimeList.length === 0 && scheduleSectionRef.current) {
            setTimeout(() => {
                scheduleSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
        }
    }, [isBasicInfoComplete, availableTimeList.length]);

    // 정기 스터디인 경우 선택된 날짜를 시작일로 자동 설정
    useEffect(() => {
        if (isRecurring && selectedDate) {
            const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
            const currentStartDate = studyStartDate ? format(new Date(studyStartDate), "yyyy-MM-dd") : null;
            if (currentStartDate !== selectedDateStr) {
                setStudyStartDate(toLocalISOString(selectedDateStr, "00:00:00"));
            }
        }
    }, [selectedDate, isRecurring]);

    const addSession = () => {
        // TimePicker의 기본값이 "09:00"이므로 빈 문자열이 아닌지 확인
        const hasStartTime = newSessionStartTime && newSessionStartTime.trim() !== "";
        const hasEndTime = newSessionEndTime && newSessionEndTime.trim() !== "";

        if (!selectedDate || !hasStartTime || !hasEndTime) {
            alert("날짜와 시작/종료 시간을 모두 입력해주세요.");
            return;
        }

        // 정기 스터디인 경우
        if (isRecurring) {
            if (selectedWeekdays.length === 0) {
                alert("정기 스터디 요일을 선택해주세요.");
                return;
            }

            if (!studyEndDate) {
                alert("스터디 종료일을 입력해주세요.");
                return;
            }

            // 선택된 날짜를 시작일로 설정
            const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
            setStudyStartDate(toLocalISOString(selectedDateStr, "00:00:00"));

            const start = new Date(selectedDate);
            const end = new Date(studyEndDate);
            const sessions: AvailableTime[] = [];

            // 시작일부터 종료일까지 반복
            const currentDate = new Date(start);
            while (currentDate <= end) {
                const weekday = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

                // 선택된 요일인 경우 스터디 생성
                if (selectedWeekdays.includes(weekday)) {
                    const dateStr = format(currentDate, "yyyy-MM-dd");
                    const startDateTime = new Date(`${dateStr}T${newSessionStartTime}:00`).toISOString();
                    const endDateTime = new Date(`${dateStr}T${newSessionEndTime}:00`).toISOString();

                    // 중복 체크 (이미 같은 날짜와 시간의 스터디가 있는지 확인)
                    const isDuplicate = availableTimeList.some(session => {
                        const sessionDate = format(new Date(session.startTime), "yyyy-MM-dd");
                        const sessionStart = format(new Date(session.startTime), "HH:mm");
                        return sessionDate === dateStr && sessionStart === newSessionStartTime;
                    });

                    if (!isDuplicate) {
                        sessions.push({
                            startTime: startDateTime,
                            endTime: endDateTime,
                            price: 0, // 스터디는 상위 레벨의 총 참가비 사용
                            seats: 0, // 스터디는 상위 레벨의 총 모집 인원 사용
                        });
                    }
                }

                // 다음 날로 이동
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // 모든 세션 추가
            sessions.forEach(session => addAvailableTime(session));

            if (sessions.length > 0) {
                alert(`${sessions.length}개의 정기 스터디 일정이 생성되었습니다.`);
            } else {
                alert("생성할 스터디 일정이 없습니다. (이미 등록된 일정이거나 조건에 맞는 날짜가 없습니다)");
            }
        } else {
            // 일반 스터디인 경우
            if (!studyStartDate || !studyEndDate) {
                alert("스터디 시작일과 종료일을 입력해주세요.");
                return;
            }

            const dateStr = format(selectedDate, "yyyy-MM-dd");

            // Convert Local Date+Time to ISO 8601 (UTC)
            const startDateTime = new Date(`${dateStr}T${newSessionStartTime}:00`).toISOString();
            const endDateTime = new Date(`${dateStr}T${newSessionEndTime}:00`).toISOString();

            const newSession: AvailableTime = {
                startTime: startDateTime,
                endTime: endDateTime,
                price: 0, // 스터디는 상위 레벨의 총 참가비 사용
                seats: 0, // 스터디는 상위 레벨의 총 모집 인원 사용
            };

            addAvailableTime(newSession);
        }

        // 초기화 (날짜는 유지하고 입력 필드만 초기화)
        setNewSessionStartTime("09:00");
        setNewSessionEndTime("10:00");
    };

    // Helper to extract date from ISO string (Local)
    const getDateFromISO = (isoString: string) => {
        return format(new Date(isoString), "yyyy-MM-dd");
    };

    const getSessionsForDate = (dateKey: string) => {
        return availableTimeList.filter((s: AvailableTime) => getDateFromISO(s.startTime) === dateKey);
    };

    const getSessionTimeRange = (session: AvailableTime) => {
        // Display time in simpler format (HH:mm)
        const start = format(new Date(session.startTime), "HH:mm");
        const end = format(new Date(session.endTime), "HH:mm");
        return `${start} - ${end}`;
    };

    // Logic to find index for removal
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
                    상세 설정 (스터디)
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
                                        {isBasicInfoComplete ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={isBasicInfoComplete ? "line-through text-gray-500" : ""}>
                                            1단계: 모집 정보 입력 (시작일, 종료일, 인원, 참가비)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {availableTimeList.length > 0 ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={availableTimeList.length > 0 ? "line-through text-gray-500" : ""}>
                                            2단계: 스터디 일정 추가
                                        </span>
                                    </div>
                                </div>
                                {isBasicInfoComplete && availableTimeList.length === 0 && (
                                    <Alert className="mt-3 bg-white border-blue-300">
                                        <ArrowDown className="size-4 text-blue-600" />
                                        <AlertTitle className="text-blue-900">다음 단계</AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            모집 정보 입력이 완료되었습니다! 이제 아래에서 스터디 일정을 추가해주세요.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 일정 선택 */}
                    <div ref={scheduleSectionRef}>
                        <h4 className="font-medium mb-2">일정 선택</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            캘린더에서 날짜를 선택하면 모집 정보 입력 폼이 나타납니다.
                        </p>

                        <CalendarModule
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            renderDateContent={(date) => {
                                const dateKey = format(date, "yyyy-MM-dd");
                                const dateSessions = getSessionsForDate(dateKey);
                                if (dateSessions.length === 0) return null;
                                return (
                                    <div className="space-y-1">
                                        {dateSessions.slice(0, 2).map((session: AvailableTime, idx: number) => (
                                            <div
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                            >
                                                {getSessionTimeRange(session)}
                                            </div>
                                        ))}
                                        {dateSessions.length > 2 && (
                                            <div className="text-xs text-gray-500 px-2">
                                                +{dateSessions.length - 2}회
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {/* 모집 정보 (날짜 선택 시 나타남) */}
                    {selectedDate && (
                        <div className="bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300">
                            <h4 className="font-medium mb-4">
                                {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 모집 정보
                            </h4>
                            <div className="space-y-4">
                                {/* 총 모집 인원 및 참가비 (상위 레벨) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm">총 모집 인원 (명) <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="number"
                                            value={seats || ''}
                                            onChange={(e) => setSeats(Number(e.target.value))}
                                            placeholder="10"
                                            min="1"
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">총 참가비 (원) <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="number"
                                            value={price || ''}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                            placeholder="100000"
                                            min="0"
                                            className="bg-white"
                                        />
                                    </div>
                                </div>

                                {/* 스터디 시작일 및 종료일 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm">스터디 시작일 <span className="text-red-500">*</span></Label>
                                        {isRecurring ? (
                                            <Input
                                                type="date"
                                                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ''}
                                                disabled
                                                className="bg-gray-100"
                                            />
                                        ) : (
                                            <Input
                                                type="date"
                                                value={studyStartDate ? new Date(studyStartDate).toLocaleDateString('en-CA') : ''}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        setStudyStartDate(toLocalISOString(e.target.value, "00:00:00"));
                                                    } else {
                                                        setStudyStartDate(null);
                                                    }
                                                }}
                                                className="bg-white"
                                            />
                                        )}
                                        {isRecurring && (
                                            <p className="text-xs text-gray-500">
                                                선택한 날짜가 시작일로 설정됩니다
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">스터디 종료일 <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="date"
                                            value={studyEndDate ? new Date(studyEndDate).toLocaleDateString('en-CA') : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setStudyEndDate(toLocalISOString(e.target.value, "23:59:59"));
                                                } else {
                                                    setStudyEndDate(null);
                                                }
                                            }}
                                            className="bg-white"
                                            min={isRecurring && selectedDate ? format(selectedDate, "yyyy-MM-dd") : (studyStartDate ? new Date(studyStartDate).toLocaleDateString('en-CA') : undefined)}
                                        />
                                    </div>
                                </div>

                                {/* 주마다 반복 여부 */}
                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox
                                            id="isRecurring"
                                            checked={isRecurring}
                                            onCheckedChange={(checked) => setIsRecurring(checked === true)}
                                        />
                                        <Label htmlFor="isRecurring" className="text-sm font-medium cursor-pointer">
                                            주마다 계속 반복하여 스터디를 정기적으로 열기
                                        </Label>
                                    </div>
                                    {isRecurring && (
                                        <div className="space-y-4 pt-3 border-t border-gray-200">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                    <Clock className="size-4" />
                                                    정기 스터디 요일 선택
                                                </Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {weekdays.map((day, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 cursor-pointer transition-all ${selectedWeekdays.includes(index)
                                                                ? "bg-[#00C471] border-[#00C471] text-white"
                                                                : "bg-white border-gray-300 text-gray-700 hover:border-[#00C471] hover:bg-[#E6F9F2]"
                                                                }`}
                                                            onClick={() => toggleWeekday(index)}
                                                        >
                                                            <span className="text-sm font-medium">{day}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {selectedWeekdays.length > 0 && (
                                                    <p className="text-xs text-gray-600">
                                                        선택한 요일: {selectedWeekdays.map(w => weekdays[w]).join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 시간대 선택 */}
                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                    <h4 className="font-medium mb-3">시간대 선택</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                </div>

                                {/* 회차 추가 버튼 */}
                                <Button
                                    type="button"
                                    onClick={addSession}
                                    className="w-full bg-[#00C471] hover:bg-[#00B366] gap-2"
                                    disabled={
                                        !selectedDate || 
                                        !newSessionStartTime?.trim() || 
                                        !newSessionEndTime?.trim() || 
                                        !price || 
                                        !seats ||
                                        (isRecurring && (selectedWeekdays.length === 0 || !studyEndDate)) ||
                                        (!isRecurring && (!studyStartDate || !studyEndDate))
                                    }
                                >
                                    <Plus className="size-4" />
                                    {isRecurring ? "정기 회차 추가" : "회차 추가"}
                                </Button>
                                {(!selectedDate || !newSessionStartTime?.trim() || !newSessionEndTime?.trim() || !price || !seats || (isRecurring && (selectedWeekdays.length === 0 || !studyEndDate)) || (!isRecurring && (!studyStartDate || !studyEndDate))) && (
                                    <p className="text-xs text-gray-500 text-center">
                                        {isRecurring 
                                            ? "모든 필드와 요일을 선택해주세요" 
                                            : "모든 필드를 입력해주세요"}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

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
                                                        {getSessionTimeRange(session)}
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
                </div>
            </CardContent>
        </Card>
    );
}
