import { useState } from "react";
import { Button } from "../ui/button";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { LessonDetail } from "../../../types/lesson";

interface MentoringScheduleViewProps {
    service: LessonDetail;
}

export function MentoringScheduleView({ service }: MentoringScheduleViewProps) {
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    // 현재 주의 월요일 계산
    const getWeekStart = (offset: number) => {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 월요일 시작
        return addWeeks(weekStart, offset);
    };

    // 일주일의 날짜 생성 (월-일)
    const getWeekDates = (offset: number) => {
        const weekStart = getWeekStart(offset);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    };

    // 특정 날짜에 가능한 시간대 찾기
    const getAvailableTimesForDate = (date: Date) => {
        if (service.schedules["1-1"]?.rawAvailableTimes) {
            return service.schedules["1-1"].rawAvailableTimes
                .filter((slot) => isSameDay(new Date(slot.startTime), date))
                .map((slot) => {
                    const startTime = new Date(slot.startTime);
                    const endTime = new Date(slot.endTime);
                    return `${startTime.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`;
                })
                .sort();
        }

        const dayMap: { [key: string]: string } = {
            "0": "일", "1": "월", "2": "화", "3": "수", "4": "목", "5": "금", "6": "토",
        };
        const dayOfWeek = dayMap[date.getDay().toString()];
        const slot = service.schedules["1-1"]?.availableTimes.find((s) => s.day === dayOfWeek);
        return slot?.times || [];
    };

    // 시간 문자열을 분으로 변환
    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    // 시간 범위를 바 위치와 너비로 변환
    const getBarStyle = (timeRange: string) => {
        const [start, end] = timeRange.split("-");
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);

        const totalMinutesInDay = 24 * 60;
        const left = (startMinutes / totalMinutesInDay) * 100;
        const width = ((endMinutes - startMinutes) / totalMinutesInDay) * 100;

        return { left: `${left}%`, width: `${width}%` };
    };

    const weekDates = getWeekDates(currentWeekOffset);
    const weekStart = getWeekStart(currentWeekOffset);

    // 지난 날짜 제외
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDates = weekDates.filter((date) => {
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate >= today;
    });

    return (
        <div>
            {/* 주간 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                    className="gap-1"
                >
                    <ChevronLeft className="size-4" />
                    이전 주
                </Button>
                <div className="text-center">
                    <h3 className="font-medium">
                        {format(weekStart, "yyyy년 M월", { locale: ko })}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {format(weekStart, "M/d", { locale: ko })} -{" "}
                        {format(addDays(weekStart, 6), "M/d", { locale: ko })}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                    className="gap-1"
                >
                    다음 주
                    <ChevronRight className="size-4" />
                </Button>
            </div>

            {/* 일주일 일정 세로 표시 */}
            <div className="space-y-2">
                {futureDates.map((date, idx) => {
                    const availableTimes = getAvailableTimesForDate(date);
                    const isToday =
                        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    const isPast = date < new Date() && !isToday;

                    return (
                        <div
                            key={idx}
                            className={`border rounded-lg p-4 transition-colors ${isPast
                                ? "bg-gray-50 border-gray-200"
                                : availableTimes.length > 0
                                    ? "border-gray-200 hover:border-[#00C471] bg-white"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* 날짜 표시 */}
                                <div
                                    className={`text-center min-w-[60px] ${isToday
                                        ? "text-[#00C471]"
                                        : isPast
                                            ? "text-gray-400"
                                            : "text-gray-900"
                                        }`}
                                >
                                    <div className={`text-xs mb-1 ${isToday ? "font-medium" : ""}`}>
                                        {format(date, "EEE", { locale: ko })}
                                    </div>
                                    <div
                                        className={`text-2xl font-bold ${isToday
                                            ? "bg-[#00C471] text-white rounded-full size-12 flex items-center justify-center mx-auto"
                                            : ""
                                            }`}
                                    >
                                        {format(date, "d")}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {format(date, "M월", { locale: ko })}
                                    </div>
                                </div>

                                {/* 시간대 표시 */}
                                <div className="flex-1">
                                    {isPast ? (
                                        <div className="text-sm text-gray-400 py-2">지난 날짜</div>
                                    ) : availableTimes.length > 0 ? (
                                        <div className="space-y-3">
                                            {/* 24시간 타임라인 레이블 */}
                                            <div className="flex justify-between text-xs text-gray-400 px-1">
                                                <span>0:00</span>
                                                <span>6:00</span>
                                                <span>12:00</span>
                                                <span>18:00</span>
                                                <span>24:00</span>
                                            </div>

                                            {/* 타임라인 바 컨테이너 */}
                                            <div className="relative h-10 bg-gray-100 rounded-lg">
                                                {/* 시간 구분선 */}
                                                <div className="absolute inset-0 flex">
                                                    {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                                                        <div
                                                            key={hour}
                                                            className={`absolute h-full border-l ${hour % 3 === 0
                                                                ? "border-gray-400"
                                                                : "border-gray-300"
                                                                }`}
                                                            style={{ left: `${(hour / 24) * 100}%` }}
                                                        />
                                                    ))}
                                                </div>

                                                {/* 가능한 시간대 바 */}
                                                {availableTimes.map((timeRange, timeIdx) => {
                                                    const barStyle = getBarStyle(timeRange);
                                                    return (
                                                        <div
                                                            key={timeIdx}
                                                            className="absolute h-full bg-[#00C471] hover:bg-[#00B366] rounded cursor-pointer transition-colors group"
                                                            style={{
                                                                left: barStyle.left,
                                                                width: barStyle.width,
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {timeRange}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* 시간대 텍스트 목록 */}
                                            <div className="flex flex-wrap gap-2">
                                                {availableTimes.map((time, timeIdx) => (
                                                    <div
                                                        key={timeIdx}
                                                        className="flex items-center gap-1 text-xs text-gray-600"
                                                    >
                                                        <Clock className="size-3 text-[#00C471]" />
                                                        <span>{time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 py-2">멘토링 불가</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                    💡 <strong>신청 방법:</strong> 원하는 날짜와 시간을 선택하여 1:1 맞춤
                    멘토링을 신청할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
