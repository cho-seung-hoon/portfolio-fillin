import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import { LessonApplicationUiModel, UiOption } from "../../../types/lesson-application-ui";

interface Slot {
    date: string;
    time: string;
    availableTimeId: string;
    startTime: string; // ISO string for the specific slot start
}

interface ScrollableTimelineProps {
    date: Date;
    timelineMinWidth: string;
    availableTimes: string[];
    bookedSlots: { time: string }[];
    selectedSlot: Slot | null;
    onBarClick: (clickX: number, barWidth: number, date: Date) => void;
    getBarStyle: (timeRange: string) => { left: string; width: string };
}

function ScrollableTimeline({
    date,
    timelineMinWidth,
    availableTimes,
    bookedSlots,
    selectedSlot,
    onBarClick,
    getBarStyle,
}: ScrollableTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setHasDragged(false);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) setHasDragged(true);
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    const isSelectedDay = selectedSlot?.date === format(date, "yyyy-MM-dd");

    // 첫 번째 이용 가능한 시간대로 자동 스크롤
    useEffect(() => {
        if (scrollContainerRef.current && availableTimes.length > 0) {
            const firstTime = availableTimes[0].split("-")[0];
            const [hours, minutes] = firstTime.split(":").map(Number);
            const totalMinutes = hours * 60 + minutes;
            const percentage = totalMinutes / (24 * 60);

            const container = scrollContainerRef.current;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;

            // 중앙에 오도록 스크롤 위치 계산
            const targetScroll = (percentage * scrollWidth) - (clientWidth / 2);
            container.scrollLeft = targetScroll;
        }
    }, [availableTimes, timelineMinWidth]); // 이용 가능한 시간이나 너비가 변경될 때마다 실행

    return (
        <div className="space-y-4">
            <div
                ref={scrollContainerRef}
                className={`w-full overflow-x-auto pb-4 scrollbar-hide touch-pan-x ${isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div className="space-y-2" style={{ minWidth: timelineMinWidth }}>
                    {/* 24시간 타임라인 레이블 - 1시간 단위 */}
                    <div className="relative h-6 text-[10px] text-gray-400">
                        {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                            <span
                                key={hour}
                                className="absolute transform -translate-x-1/2 whitespace-nowrap"
                                style={{ left: `${(hour / 24) * 100}%` }}
                            >
                                {hour}:00
                            </span>
                        ))}
                    </div>

                    {/* 선택된 시간 표시 (레이블과 그래프 사이) */}
                    <div className="h-6 relative">
                        {isSelectedDay && selectedSlot.time && (() => {
                            const style = getBarStyle(selectedSlot.time);
                            return (
                                <div
                                    className="absolute transform -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-[#00C471] bg-[#E6F9F2] px-2 py-0.5 rounded-full border border-[#00C471]/20 shadow-sm"
                                    style={{
                                        left: `calc(${style.left} + (${style.width} / 2))`,
                                        top: "0"
                                    }}
                                >
                                    {selectedSlot.time.replace("-", " ~ ")}
                                </div>
                            );
                        })()}
                    </div>

                    {/* 타임라인 바 컨테이너 */}
                    <div
                        className="relative h-10 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            if (!hasDragged) {
                                onBarClick(clickX, rect.width, date);
                            }
                        }}
                    >
                        {/* 시간 구분선 - 10분 단위 (중요: 모든 바 위에 보이도록 z-index 조정) */}
                        <div className="absolute inset-0 flex pointer-events-none z-20">
                            {Array.from({ length: 144 }, (_, i) => i).map((tenMin) => {
                                const isHour = tenMin % 6 === 0;
                                const isThreeHour = tenMin % 18 === 0;

                                return (
                                    <div
                                        key={tenMin}
                                        className={`absolute h-full border-l ${isThreeHour
                                            ? "border-gray-400"
                                            : isHour
                                                ? "border-gray-300"
                                                : "border-gray-200"
                                            }`}
                                        style={{
                                            left: `${(tenMin / 144) * 100}%`,
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* 가능한 시간대 바 */}
                        {availableTimes.map((timeRange: string, timeIdx: number) => {
                            const barStyle = getBarStyle(timeRange);
                            return (
                                <div
                                    key={timeIdx}
                                    className="absolute h-full bg-[#E0F7ED] border-x border-[#A7F3D0] rounded pointer-events-none"
                                    style={{
                                        left: barStyle.left,
                                        width: barStyle.width,
                                    }}
                                />
                            );
                        })}

                        {/* 예약된 시간 슬롯 바 */}
                        {bookedSlots.map((bookedSlot: any, bookedIdx: number) => {
                            const barStyle = getBarStyle(bookedSlot.time);
                            return (
                                <div
                                    key={bookedIdx}
                                    className="absolute h-full bg-red-100 border border-red-300 rounded pointer-events-none z-[5]"
                                    style={{
                                        left: barStyle.left,
                                        width: barStyle.width,
                                    }}
                                    title={`예약됨: ${bookedSlot.time}`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[10px] text-red-600 font-medium">예약</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* 선택된 시간 슬롯 바 */}
                        {isSelectedDay && selectedSlot.time && (() => {
                            const barStyle = getBarStyle(selectedSlot.time);
                            return (
                                <div
                                    className="absolute h-full bg-[#00C471] rounded pointer-events-none z-10"
                                    style={{
                                        left: barStyle.left,
                                        width: barStyle.width,
                                    }}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>
            {/* 날짜별 선택 정보 알림 - 가로 스크롤 영역 밖 (정적) */}
            {isSelectedDay && selectedSlot.time && (
                <div className="flex items-center gap-2 text-sm text-[#00C471] bg-[#E6F9F2] px-3 py-2 rounded-lg w-full">
                    <Clock className="size-4" />
                    <span className="font-medium">선택된 시간: {selectedSlot.time}</span>
                </div>
            )}
        </div>
    );
}

interface MentoringApplicationViewProps {
    lesson: LessonApplicationUiModel;
    selectedOptionId: string;
    onSelectOptionId: (id: string) => void;
    selectedSlot: Slot | null;
    onSelectSlot: (slot: Slot | null) => void;
}

export function MentoringApplicationView({
    lesson,
    selectedOptionId,
    onSelectOptionId,
    selectedSlot,
    onSelectSlot,
}: MentoringApplicationViewProps) {
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    const selectedOption = lesson.options?.find((opt) => opt.optionId === selectedOptionId);

    // 멘토링 시간에 따른 타임라인 너비 동적 계산
    const getDynamicMinWidth = () => {
        if (!selectedOption) return "1600px";
        const duration = selectedOption.minute;
        // 30분 기준 2400px, 시간이 짧아지면 더 확대, 길어지면 축소 (최소 1000px, 최대 5000px)
        const calculatedWidth = Math.max(1000, Math.min(5000, (2400 * 30) / duration));
        return `${calculatedWidth}px`;
    };

    const timelineMinWidth = getDynamicMinWidth();

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

    // 특정 날짜에 가능한 시간대 찾기 (1:1 Mentoring)
    const getAvailableTimesForDate = (date: Date) => {
        const rawTimes = lesson.schedules?.["1-1"]?.rawAvailableTimes || [];
        const dateStr = format(date, "yyyy-MM-dd");

        const timesForDate = rawTimes.filter((t: any) => {
            const tDate = new Date(t.startTime);
            return format(tDate, "yyyy-MM-dd") === dateStr;
        });

        return timesForDate.map((t: any) => {
            const start = new Date(t.startTime);
            const end = new Date(t.endTime);
            const formatTime = (d: Date) => d.toTimeString().slice(0, 5); // "HH:mm"
            return `${formatTime(start)}-${formatTime(end)}`;
        });
    };

    // 특정 날짜의 예약된 슬롯 가져오기
    const getBookedSlotsForDate = (date: Date): { time: string }[] => {
        return [];
    };

    // 두 시간 범위가 겹치는지 확인
    const isTimeOverlapping = (
        start1: number,
        end1: number,
        start2: number,
        end2: number
    ): boolean => {
        return start1 < end2 && end1 > start2;
    };

    // 시간 문자열을 분으로 변환
    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    // 분을 시간 문자열로 변환
    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    // 특정 시간이 가능한 시간 범위 내에 있는지 확인
    const isTimeInRange = (timeMinutes: number, date: Date): boolean => {
        const timeRanges = getAvailableTimesForDate(date);

        for (const range of timeRanges) {
            const [start, end] = range.split("-");
            const startMinutes = timeToMinutes(start);
            const endMinutes = timeToMinutes(end);

            if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
                return true;
            }
        }

        return false;
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

    // 바 클릭 시 시간 슬롯 생성
    const handleBarClick = (clickX: number, barWidth: number, date: Date) => {
        if (!selectedOption) return;

        const durationMinutes = selectedOption.minute;
        const clickPercentage = clickX / barWidth;
        const totalMinutesInDay = 24 * 60;
        const clickedMinutes = Math.floor(clickPercentage * totalMinutesInDay);

        // 10분 단위로 반올림
        const roundedMinutes = Math.floor(clickedMinutes / 10) * 10;

        // 클릭한 시간이 가능한 시간 범위 내에 있는지 확인
        if (!isTimeInRange(roundedMinutes, date)) return;

        // 종료 시간도 가능한 범위 내에 있는지 확인
        const endMinutes = roundedMinutes + durationMinutes;
        const rawTimes = lesson.schedules?.["1-1"]?.rawAvailableTimes || [];

        // Find which raw available time this slot belongs to
        let matchedRawTime: any = null;

        for (const raw of rawTimes) {
            const rawDate = new Date(raw.startTime);
            if (format(rawDate, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")) continue;

            const startMinutes = new Date(raw.startTime).getHours() * 60 + new Date(raw.startTime).getMinutes();
            const rawEndMinutes = new Date(raw.endTime).getHours() * 60 + new Date(raw.endTime).getMinutes();

            if (roundedMinutes >= startMinutes && endMinutes <= rawEndMinutes) {
                matchedRawTime = raw;
                break;
            }
        }

        if (!matchedRawTime) return;

        // Double check validity (redundant but safe)
        const timeRanges = getAvailableTimesForDate(date);
        let isValidSlot = false;

        for (const range of timeRanges) {
            const [start, end] = range.split("-");
            const startMinutes = timeToMinutes(start);
            const endMinutesRange = timeToMinutes(end);

            if (roundedMinutes >= startMinutes && endMinutes <= endMinutesRange) {
                isValidSlot = true;
                break;
            }
        }

        if (!isValidSlot) return;

        // 예약된 슬롯과 겹치는지 확인
        const bookedSlots = getBookedSlotsForDate(date);
        for (const booked of bookedSlots) {
            const [bookedStart, bookedEnd] = booked.time.split("-");
            const bookedStartMinutes = timeToMinutes(bookedStart);
            const bookedEndMinutes = timeToMinutes(bookedEnd);

            if (isTimeOverlapping(roundedMinutes, endMinutes, bookedStartMinutes, bookedEndMinutes)) {
                return;
            }
        }

        const startTime = minutesToTime(roundedMinutes);
        const endTime = minutesToTime(endMinutes);
        const timeStr = `${startTime}-${endTime}`;

        // Construct ISO startTime for the specific selected slot
        const slotStartDate = new Date(date);
        slotStartDate.setHours(Math.floor(roundedMinutes / 60), roundedMinutes % 60, 0, 0);

        onSelectSlot({
            date: format(date, "yyyy-MM-dd"),
            time: timeStr,
            availableTimeId: matchedRawTime.availableTimeId,
            startTime: slotStartDate.toISOString()
        });
    };

    const weekStart = getWeekStart(currentWeekOffset);
    const weekDates = getWeekDates(currentWeekOffset);
    const futureDates = weekDates.filter((d) => d >= addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0));

    return (
        <div className="space-y-8">
            {/* 옵션 선택 */}
            <div>
                <h3 className="font-medium mb-4">멘토링 옵션 선택</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lesson.options?.map((option) => (
                        <button
                            key={option.optionId}
                            onClick={() => {
                                onSelectOptionId(option.optionId);
                                onSelectSlot(null); // 옵션 변경 시 선택 초기화
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedOptionId === option.optionId
                                ? "border-[#00C471] bg-[#F0FDF4]"
                                : "border-gray-100 hover:border-gray-200 bg-white"
                                }`}
                        >
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{option.title || option.name}</span>
                                    {selectedOptionId === option.optionId && (
                                        <div className="bg-[#00C471] text-white p-0.5 rounded-full">
                                            <Check className="size-3" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm text-gray-500">{option.duration}</span>
                            </div>
                            <div className="text-lg font-bold text-[#00C471]">
                                ₩{option.price.toLocaleString()}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 날짜/시간 선택 */}
            {selectedOption && (
                <div>
                    <h3 className="font-medium mb-4">날짜 및 시간 선택</h3>

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
                    <div className="space-y-4">
                        {futureDates.map((date, idx) => {
                            const availableTimes = getAvailableTimesForDate(date);
                            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                            const isPast = date < new Date() && !isToday;

                            return (
                                <div
                                    key={idx}
                                    className={`border rounded-xl p-5 transition-colors ${isPast
                                        ? "bg-gray-50 border-gray-200"
                                        : availableTimes.length > 0
                                            ? "border-gray-200 hover:border-[#00C471] bg-white shadow-sm"
                                            : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-6">
                                        {/* 날짜 표시 */}
                                        <div className={`text-center min-w-[64px] ${isToday ? "text-[#00C471]" : isPast ? "text-gray-400" : "text-gray-900"}`}>
                                            <div className={`text-xs mb-1 uppercase tracking-wider ${isToday ? "font-bold" : "font-medium text-gray-400"}`}>
                                                {format(date, "EEE", { locale: ko })}
                                            </div>
                                            <div className={`text-2xl font-bold ${isToday ? "bg-[#00C471] text-white rounded-full size-12 flex items-center justify-center mx-auto shadow-md shadow-[#00C471]/20" : ""}`}>
                                                {format(date, "d")}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-2 font-medium">
                                                {format(date, "M월", { locale: ko })}
                                            </div>
                                        </div>

                                        {/* 시간대 표시 */}
                                        <div className="flex-1 min-w-0">
                                            {isPast ? (
                                                <div className="text-sm text-gray-400 py-4 flex items-center gap-2">
                                                    <Clock className="size-4 opacity-50" />
                                                    지난 날짜는 선택할 수 없습니다.
                                                </div>
                                            ) : availableTimes.length > 0 ? (
                                                <ScrollableTimeline
                                                    date={date}
                                                    timelineMinWidth={timelineMinWidth}
                                                    availableTimes={availableTimes}
                                                    bookedSlots={getBookedSlotsForDate(date)}
                                                    selectedSlot={selectedSlot}
                                                    onBarClick={handleBarClick}
                                                    getBarStyle={getBarStyle}
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-400 py-4">예약 가능한 시간이 없습니다.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                            💡 <strong>신청 방법:</strong> 원하는 날짜와 시간을 선택하여 1:1
                            맞춤 멘토링을 신청할 수 있습니다.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
