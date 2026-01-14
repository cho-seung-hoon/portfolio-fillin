
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Clock, Trash2 } from "lucide-react";
import { CalendarModule } from "./CalendarModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface AvailableTime {
    id: string;
    startTime: string;
    endTime: string;
}

export interface DaySchedule {
    [dateKey: string]: AvailableTime[];
}

interface MentoringScheduleSectionProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date) => void;
    daySchedules: DaySchedule;
    selectingStartHour: number | null;
    onTimeBarClick: (hour: number) => void;
    isHourInSchedule: (hour: number) => boolean;
    isHourInSelectingRange: (hour: number) => boolean;
    onRemoveTimeSlot: (id: string) => void;
}

export function MentoringScheduleSection({
    selectedDate,
    onDateSelect,
    daySchedules,
    selectingStartHour,
    onTimeBarClick,
    isHourInSchedule,
    isHourInSelectingRange,
    onRemoveTimeSlot,
}: MentoringScheduleSectionProps) {

    const getSelectedDateSchedule = () => {
        if (!selectedDate) return [];
        const dateKey = format(selectedDate, "yyyy-MM-dd");
        return daySchedules[dateKey] || [];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="size-5" />
                    가능한 시간 설정
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* 캘린더 (전체 너비) */}
                <div className="space-y-6">
                    <CalendarModule
                        selectedDate={selectedDate}
                        onDateSelect={onDateSelect}
                        renderDateContent={(date) => {
                            const dateKey = format(date, "yyyy-MM-dd");
                            const schedules = daySchedules[dateKey] || [];
                            if (schedules.length === 0) return null;
                            return (
                                <div className="space-y-1">
                                    {schedules.slice(0, 2).map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                        >
                                            {schedule.startTime}-{schedule.endTime}
                                        </div>
                                    ))}
                                    {schedules.length > 2 && (
                                        <div className="text-xs text-gray-500 px-2">
                                            +{schedules.length - 2}개
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />

                    {/* 선택된 날짜 정보 */}
                    {selectedDate && (
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                    {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })}
                                </h4>
                                <span className="text-sm text-gray-500">
                                    총 {getSelectedDateSchedule().length}개의 시간대
                                </span>
                            </div>

                            {getSelectedDateSchedule().length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {getSelectedDateSchedule().map((timeSlot) => (
                                        <div
                                            key={timeSlot.id}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md"
                                        >
                                            <span className="text-sm font-medium">
                                                {timeSlot.startTime} - {timeSlot.endTime}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveTimeSlot(timeSlot.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 하단: 시간 선택 바 */}
                {selectedDate && (
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium mb-3">시간대 선택</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectingStartHour === null
                                ? "시작 시간을 클릭하세요"
                                : "종료 시간을 클릭하세요"}
                        </p>

                        {/* 24시간 타임라인 바 */}
                        <div className="relative">
                            {/* 시간 레이블 */}
                            <div className="flex mb-2">
                                {Array.from({ length: 25 }, (_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 text-center"
                                        style={{ width: `${100 / 24}%` }}
                                    >
                                        {i % 3 === 0 && (
                                            <span className="text-xs text-gray-500">
                                                {String(i).padStart(2, '0')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* 시간 바 */}
                            <div className="flex border-2 border-gray-300 rounded-md overflow-hidden">
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const isScheduled = isHourInSchedule(hour);
                                    const isSelecting = isHourInSelectingRange(hour);
                                    const isStartHour = selectingStartHour === hour;

                                    return (
                                        <button
                                            key={hour}
                                            type="button"
                                            onClick={() => onTimeBarClick(hour)}
                                            disabled={isScheduled}
                                            className={`
                        flex-1 h-16 border-r border-gray-200 last:border-r-0 transition-all relative
                        ${isScheduled
                                                    ? "bg-[#00C471] cursor-not-allowed"
                                                    : isSelecting
                                                        ? "bg-[#B8E9D6]"
                                                        : isStartHour
                                                            ? "bg-[#E6F9F2] ring-2 ring-[#00C471] ring-inset"
                                                            : "bg-white hover:bg-gray-50"
                                                }
                      `}
                                            title={`${String(hour).padStart(2, '0')}:00`}
                                        >
                                            {/* 시간 구분선 */}
                                            {hour % 3 === 0 && (
                                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 하단 가이드 */}
                            <div className="flex gap-4 mt-4 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#00C471] rounded" />
                                    <span>이미 선택됨</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#B8E9D6] rounded" />
                                    <span>선택 중</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
                                    <span>선택 가능</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
