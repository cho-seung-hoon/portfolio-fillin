import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import {
    format,
    addDays,
    startOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { LessonDetail } from "../../../types/lesson";

interface OneDayClassScheduleViewProps {
    service: LessonDetail;
}

export function OneDayClassScheduleView({ service }: OneDayClassScheduleViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 1:N 원데이 캘린더 관련 함수
    const getOnedaySessionsForDate = (date: Date) => {
        return service.schedules["1-n-oneday"]?.sessions.filter((session) => {
            const [year, month, day] = session.date.split("-").map(Number);
            const sessionDate = new Date(year, month - 1, day);
            return isSameDay(sessionDate, date);
        }) || [];
    };

    const hasOnedaySession = (date: Date) => {
        return getOnedaySessionsForDate(date).length > 0;
    };

    // 캘린더에 표시할 날짜들 생성
    const getCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
        const endDate = addDays(startDate, 41); // 6주 표시 (42일)

        return eachDayOfInterval({ start: startDate, end: endDate });
    };

    const calendarDays = getCalendarDays();
    const selectedDateSessions = selectedDate ? getOnedaySessionsForDate(selectedDate) : [];

    return (
        <div>
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="gap-1"
                >
                    <ChevronLeft className="size-4" />
                    이전 달
                </Button>
                <h3 className="font-medium">
                    {format(currentMonth, "yyyy년 M월", { locale: ko })}
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="gap-1"
                >
                    다음 달
                    <ChevronRight className="size-4" />
                </Button>
            </div>

            {/* 캘린더 */}
            <div className="mb-6">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                        <div
                            key={day}
                            className={`text-center text-sm font-medium py-2 ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-700"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* 캘린더 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());
                        const isPast = day < new Date() && !isToday;
                        const daySessions = getOnedaySessionsForDate(day);
                        const hasSession = daySessions.length > 0;
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const dayOfWeek = day.getDay();

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (hasSession && !isPast) {
                                        setSelectedDate(day);
                                    }
                                }}
                                disabled={!hasSession || isPast}
                                className={`
                  min-h-[100px] p-2 rounded-lg text-sm transition-all relative flex flex-col items-start
                  ${!isCurrentMonth ? "text-gray-300" : ""}
                  ${isPast ? "opacity-40 cursor-not-allowed" : ""}
                  ${isToday ? "ring-2 ring-[#00C471]" : ""}
                  ${isSelected ? "bg-[#00C471] text-white" : ""}
                  ${hasSession && !isPast && !isSelected ? "bg-[#E6F9F2] hover:bg-[#D0F5E9]" : ""}
                  ${!hasSession && !isPast && !isSelected ? "hover:bg-gray-100" : ""}
                `}
                            >
                                {/* 날짜 숫자 */}
                                <div
                                    className={`font-medium mb-1 ${isToday ? "font-bold" : ""} ${dayOfWeek === 0 && isCurrentMonth && !isSelected ? "text-red-500" : ""
                                        } ${dayOfWeek === 6 && isCurrentMonth && !isSelected ? "text-blue-500" : ""}`}
                                >
                                    {format(day, "d")}
                                </div>

                                {/* 세션 정보 표시 (최대 3개) */}
                                {hasSession && !isPast && (
                                    <div className="w-full space-y-1">
                                        {daySessions.slice(0, 3).map((session, sessionIdx) => (
                                            <div
                                                key={sessionIdx}
                                                className={`text-xs px-1 py-0.5 rounded truncate ${isSelected ? "bg-white/20 text-white" : "bg-[#00C471] text-white"
                                                    }`}
                                                title={`${session.time} (잔여 ${session.remaining}/${session.maxSeats}석)`}
                                            >
                                                {session.time.split("-")[0]}
                                            </div>
                                        ))}
                                        {/* 4개 이상일 경우 "+N개 더" 표시 */}
                                        {daySessions.length > 3 && (
                                            <div
                                                className={`text-xs px-1 py-0.5 rounded font-medium ${isSelected ? "text-white/80" : "text-[#00C471]"
                                                    }`}
                                            >
                                                +{daySessions.length - 3}개 더
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 선택된 날짜의 세션 정보 */}
            {selectedDate && selectedDateSessions.length > 0 ? (
                <div>
                    <h3 className="font-medium mb-3">
                        {format(selectedDate, "M월 d일 (EEE)", { locale: ko })} 일정
                    </h3>
                    <div className="space-y-3">
                        {selectedDateSessions.map((session, idx) => (
                            <div
                                key={idx}
                                className="border border-[#00C471] bg-[#E6F9F2] rounded-lg p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="size-5 text-[#00C471]" />
                                    <div>
                                        <div className="font-medium text-[#00C471]">{session.time}</div>
                                        <div className="text-sm text-gray-600 mt-1">원데이 클래스</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-[#00C471] font-medium">
                                        잔여 {session.remaining}/{session.maxSeats}석
                                    </div>
                                    {session.remaining <= 3 && (
                                        <div className="text-xs text-red-500 mt-1">마감 임박</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Calendar className="size-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">
                        캘린더에서 날짜를 선택하면<br />
                        해당 일자의 원데이 클래스 일정을 확인할 수 있습니다.
                    </p>
                </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                    💡 <strong>원데이 클래스:</strong> 캘린더에서 날짜를 선택하면 해당 일자의 상세 일정을 확인할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
