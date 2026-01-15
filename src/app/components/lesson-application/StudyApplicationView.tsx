import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import {
    format,
    startOfMonth,
    endOfMonth,
    addDays,
    addMonths,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";
import { LessonApplicationUiModel } from "../../../types/lesson-application-ui";

interface StudyApplicationViewProps {
    lesson: LessonApplicationUiModel;
}

export function StudyApplicationView({ lesson }: StudyApplicationViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 원데이 클래스용: 캘린더 날짜 생성
    const calendarDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    // 월의 첫 날 이전 빈 칸 추가 (일요일 시작 기준)
    const firstDayOfMonth = startOfMonth(currentMonth);
    const startPadding = firstDayOfMonth.getDay();
    const paddedCalendarDays = [
        ...Array.from({ length: startPadding }, (_, i) =>
            addDays(firstDayOfMonth, -(startPadding - i))
        ),
        ...calendarDays,
    ];

    // 특정 날짜의 스터디 세션 찾기
    const getStudySessionsForDate = (date: Date) => {
        if (!lesson.schedules?.["1-n-study"]?.sessions) return [];

        const dateStr = format(date, "yyyy-MM-dd");
        return lesson.schedules["1-n-study"].sessions.filter(
            (session: any) => session.date === dateStr
        );
    };

    const selectedStudySessions = selectedDate
        ? getStudySessionsForDate(selectedDate)
        : [];

    return (
        <div>
            {/* 스터디 개요 */}
            <div className="mb-4 p-4 bg-[#E6F9F2] rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-[#00C471]">
                            전체 {lesson.schedules?.["1-n-study"]?.totalSessions}회차 스터디
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                            기간: {lesson.schedules?.["1-n-study"]?.duration}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-[#00C471] font-medium">
                            잔여 {lesson.schedules?.["1-n-study"]?.remaining}/
                            {lesson.schedules?.["1-n-study"]?.maxSeats}석
                        </div>
                    </div>
                </div>
            </div>

            {/* 커리큘럼 리스트 */}
            <h4 className="font-medium mb-3">커리큘럼</h4>
            <div className="space-y-2 mb-6">
                {lesson.schedules?.["1-n-study"]?.sessions?.map(
                    (session: any, idx: number) => {
                        const [year, month, day] = session.date.split("-").map(Number);
                        const dateObj = new Date(year, month - 1, day);

                        return (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-lg p-4 hover:border-[#00C471] transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 size-10 rounded-full bg-[#E6F9F2] text-[#00C471] flex items-center justify-center font-bold">
                                        {session.session}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium mb-1">{session.topic}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {format(dateObj, "M월 d일 (EEE)", { locale: ko })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {session.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                    💡 <strong>스터디 과정:</strong> 전체{" "}
                    {lesson.schedules?.["1-n-study"]?.totalSessions}회차를 모두 수강해야
                    하며, 체계적인 학습을 위해 순차적으로 진행됩니다.
                </p>
            </div>

            {/* 스터디 일정 캘린더 */}
            <div>
                <h4 className="font-medium mb-4">일정 캘린더</h4>

                {/* 월 네비게이션 */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
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
                                className={`text-center text-sm font-medium py-2 ${idx === 0
                                    ? "text-red-500"
                                    : idx === 6
                                        ? "text-blue-500"
                                        : "text-gray-700"
                                    }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 캘린더 날짜 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                        {paddedCalendarDays.map((day, idx) => {
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
                                            ${!isCurrentMonth
                                            ? "text-gray-300"
                                            : ""
                                        }
                                            ${isToday
                                            ? "ring-2 ring-[#00C471]"
                                            : ""
                                        }
                                            ${isSelected
                                            ? "bg-[#00C471] text-white"
                                            : ""
                                        }
                                            ${hasSession && !isSelected
                                            ? "bg-[#FFF4E6] hover:bg-[#FFE8CC]"
                                            : ""
                                        }
                                            ${!hasSession && !isSelected
                                            ? "hover:bg-gray-100"
                                            : ""
                                        }
                                          `}
                                >
                                    {/* 날짜 숫자 */}
                                    <div
                                        className={`font-medium mb-1 ${isToday ? "font-bold" : ""
                                            } ${dayOfWeek === 0 && isCurrentMonth && !isSelected
                                                ? "text-red-500"
                                                : ""
                                            } ${dayOfWeek === 6 && isCurrentMonth && !isSelected
                                                ? "text-blue-500"
                                                : ""
                                            }`}
                                    >
                                        {format(day, "d")}
                                    </div>

                                    {/* 스터디 회차 정보 표시 */}
                                    {hasSession &&
                                        studySessions.map((session: any, sessionIdx: number) => (
                                            <div key={sessionIdx} className="w-full space-y-1">
                                                <div
                                                    className={`text-xs px-1.5 py-1 rounded font-medium ${isSelected
                                                        ? "bg-white/20 text-white"
                                                        : "bg-[#FF9500] text-white"
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

                {/* 선택된 날짜의 스터디 세션 정보 */}
                {selectedDate && selectedStudySessions.length > 0 ? (
                    <div>
                        <h3 className="font-medium mb-3">
                            {format(selectedDate, "M월 d일 (EEE)", { locale: ko })} 일정
                        </h3>
                        <div className="space-y-3">
                            {selectedStudySessions.map((session: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="border border-[#FF9500] bg-[#FFF4E6] rounded-lg p-4"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-10 rounded-full bg-[#FF9500] text-white flex items-center justify-center font-bold">
                                            {session.session}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-[#FF9500]">
                                                {session.topic}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 ml-13">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-4" />
                                            {session.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Calendar className="size-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">
                            캘린더에서 날짜를 선택하면
                            <br />
                            해당 일자의 스터디 일정을 확인할 수 있습니다.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
