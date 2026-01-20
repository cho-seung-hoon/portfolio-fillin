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

interface StudyScheduleViewProps {
    service: LessonDetail;
}

export function StudyScheduleView({ service }: StudyScheduleViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 1:N 스터디 캘린더 관련 함수
    const getStudySessionsForDate = (date: Date) => {
        return service.schedules["1-n-study"]?.sessions.filter((session) => {
            const [year, month, day] = session.date.split("-").map(Number);
            const sessionDate = new Date(year, month - 1, day);
            return isSameDay(sessionDate, date);
        }) || [];
    };

    const hasStudySession = (date: Date) => {
        return getStudySessionsForDate(date).length > 0;
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

    return (
        <div>
            <div className="mb-4 p-4 bg-[#E6F9F2] rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-[#00C471]">
                            전체 {service.schedules["1-n-study"]?.totalSessions}회차 스터디
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                            기간: {service.schedules["1-n-study"]?.duration}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-[#00C471] font-medium">
                            잔여 {service.schedules["1-n-study"]?.remaining}/
                            {service.schedules["1-n-study"]?.maxSeats}석
                        </div>
                    </div>
                </div>
            </div>

            {/* 회차별 일정 */}
            <div className="mb-8">
                <h4 className="font-medium mb-3">회차별 일정</h4>
                <div className="space-y-2">
                    {service.schedules["1-n-study"]?.sessions.map((session, idx) => {
                        const [year, month, day] = session.date.split("-").map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        const isSelected = selectedDate && isSameDay(dateObj, selectedDate);

                        return (
                            <div
                                key={idx}
                                className={`border rounded-lg py-2 px-4 flex items-center gap-4 transition-all ${isSelected
                                        ? "border-[#00C471] bg-[#E6F9F2] ring-1 ring-[#00C471]"
                                        : "border-gray-100 bg-gray-50/50"
                                    }`}
                            >
                                <div className={`flex-shrink-0 size-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${isSelected
                                        ? "bg-[#00C471] text-white border-[#00C471]"
                                        : "bg-white border-gray-200 text-gray-400"
                                    }`}>
                                    {session.session}
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div className={`font-medium transition-colors ${isSelected ? "text-[#00C471]" : "text-gray-900"
                                        }`}>
                                        {format(dateObj, "M월 d일 (EEE)", { locale: ko })}
                                    </div>
                                    <div className={`text-sm flex items-center gap-1.5 transition-colors ${isSelected ? "text-[#00C471]/80" : "text-gray-500"
                                        }`}>
                                        <Clock className="size-3.5" />
                                        {session.time}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                        💡 <strong>스터디 과정:</strong> 전체{" "}
                        {service.schedules["1-n-study"]?.totalSessions}회차를 모두 수강해야 하며,
                        체계적인 학습을 위해 순차적으로 진행됩니다.
                    </p>
                </div>
            </div>

            {/* 일정 캘린더 */}
            <div className="mb-8">
                <h4 className="font-medium mb-4">일정 캘린더</h4>

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
                            const studySessions = getStudySessionsForDate(day);
                            const hasSession = studySessions.length > 0;
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const dayOfWeek = day.getDay();

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (hasSession) {
                                            setSelectedDate(day);
                                        }
                                    }}
                                    disabled={!hasSession}
                                    className={`
                    min-h-[100px] p-2 rounded-lg text-sm transition-all relative flex flex-col items-start
                    ${!isCurrentMonth ? "text-gray-300" : ""}
                    ${isToday ? "ring-2 ring-[#00C471]" : ""}
                    ${isSelected ? "bg-[#00C471] text-white" : ""}
                    ${hasSession && !isSelected ? "bg-[#FFF4E6] hover:bg-[#FFE8CC]" : ""}
                    ${!hasSession && !isSelected ? "hover:bg-gray-100" : ""}
                  `}
                                >
                                    {/* 날짜 숫자 */}
                                    <div
                                        className={`font-medium mb-1 ${isToday ? "font-bold" : ""} ${dayOfWeek === 0 && isCurrentMonth && !isSelected ? "text-red-500" : ""
                                            } ${dayOfWeek === 6 && isCurrentMonth && !isSelected ? "text-blue-500" : ""}`}
                                    >
                                        {format(day, "d")}
                                    </div>

                                    {/* 스터디 회차 정보 표시 */}
                                    {hasSession &&
                                        studySessions.map((session, sessionIdx) => (
                                            <div key={sessionIdx} className="w-full space-y-1">
                                                <div
                                                    className={`text-xs px-1.5 py-1 rounded font-medium ${isSelected ? "bg-white/20 text-white" : "bg-[#FF9500] text-white"
                                                        }`}
                                                    title={`${session.session}회차: ${session.topic}`}
                                                >
                                                    {session.session}회차
                                                </div>
                                                <div
                                                    className={`text-xs px-1 py-0.5 rounded truncate ${isSelected ? "text-white/90" : "text-gray-700"
                                                        }`}
                                                    title={session.time}
                                                >
                                                    {session.time.split("-")[0]}
                                                </div>
                                            </div>
                                        ))}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
