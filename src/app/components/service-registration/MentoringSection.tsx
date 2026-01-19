
import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarModule } from "./CalendarModule";
import { useMentoringRegistrationStore, AvailableTime } from "../../../store/useMentoringRegistrationStore";

export function MentoringSection() {
    // Store State & Actions
    const {
        mentoringOptions,
        availableTimeList,
        addMentoringOption,
        removeMentoringOption,
        updateMentoringOptionName,
        addPriceOption,
        removePriceOption,
        updatePriceOption,
        addAvailableTime,
        removeAvailableTime
    } = useMentoringRegistrationStore();

    // Local UI State for interactions
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectingStartHour, setSelectingStartHour] = useState<number | null>(null);

    // --- Schedule Logic (Adapted for flat list) ---
    const getDateFromISO = (isoString: string) => {
        return format(new Date(isoString), "yyyy-MM-dd");
    };

    const getDateKey = (date: Date) => {
        return format(date, "yyyy-MM-dd");
    };

    const getSelectedDateSchedule = () => {
        if (!selectedDate) return [];
        const dateKey = getDateKey(selectedDate);
        return availableTimeList.filter(slot => getDateFromISO(slot.startTime) === dateKey);
    };

    const handleTimeBarClick = (hour: number) => {
        if (!selectedDate) return;

        if (selectingStartHour === null) {
            setSelectingStartHour(hour);
        } else {
            const startHour = Math.min(selectingStartHour, hour);
            const endHour = Math.max(selectingStartHour, hour) + 1;

            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const startStr = `${String(startHour).padStart(2, '0')}:00`;
            const endStr = `${String(endHour).padStart(2, '0')}:00`;

            // Convert to ISO (UTC) using local date + time
            const startTimeISO = new Date(`${dateStr}T${startStr}`).toISOString();
            const endTimeISO = new Date(`${dateStr}T${endStr}`).toISOString();

            const newTimeSlot: AvailableTime = {
                startTime: startTimeISO,
                endTime: endTimeISO,
                price: 0,
                seats: 1
            };

            addAvailableTime(newTimeSlot);
            setSelectingStartHour(null);
        }
    };

    const removeTimeSlot = (slot: AvailableTime) => {
        const index = availableTimeList.indexOf(slot);
        if (index !== -1) {
            removeAvailableTime(index);
        }
    };

    const isHourInSchedule = (hour: number) => {
        const schedule = getSelectedDateSchedule();
        return schedule.some(slot => {
            const slotStart = new Date(slot.startTime).getHours();
            const slotEnd = new Date(slot.endTime).getHours();
            // Note: This simple getHours() comparison assumes sessions don't span days 
            // and sticking to local timezone display.
            return hour >= slotStart && hour < slotEnd;
        });
    };

    const isHourInSelectingRange = (hour: number) => {
        if (selectingStartHour === null) return false;
        const min = Math.min(selectingStartHour, hour);
        const max = Math.max(selectingStartHour, hour);
        return hour >= min && hour <= max;
    };

    const formatTimeRange = (slot: AvailableTime) => {
        const start = format(new Date(slot.startTime), "HH:mm");
        const end = format(new Date(slot.endTime), "HH:mm");
        return `${start}-${end}`;
    };

    return (
        <div className="space-y-6">
            {/* 멘토링 옵션 부분 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>멘토링 옵션</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMentoringOption}
                            className="gap-2"
                        >
                            <Plus className="size-4" />
                            옵션 추가
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            제공할 멘토링 옵션과 각 옵션별 시간/가격을 설정해주세요
                        </p>

                        <div className="space-y-3">
                            {mentoringOptions.map((option, index) => (
                                <div
                                    key={option.id}
                                    className="p-4 bg-gray-50 rounded-md space-y-3"
                                >
                                    {/* 옵션 이름 */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={option.name}
                                            onChange={(e) =>
                                                updateMentoringOptionName(option.id, e.target.value)
                                            }
                                            placeholder={`옵션 ${index + 1} (예: 기본 상담)`}
                                            className="flex-1 bg-white"
                                        />
                                        {mentoringOptions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMentoringOption(option.id)}
                                            >
                                                <Trash2 className="size-4 text-gray-400" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* 진행시간 및 가격 추가 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-gray-600">
                                                진행시간 및 가격
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addPriceOption(option.id)}
                                                className="gap-1 h-8 text-xs"
                                            >
                                                <Plus className="size-3" />
                                                추가
                                            </Button>
                                        </div>

                                        {option.priceOptions.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-3 bg-white rounded border border-dashed border-gray-300">
                                                시간/가격을 추가해주세요
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {option.priceOptions.map((priceOption) => (
                                                    <div
                                                        key={priceOption.id}
                                                        className="flex items-end gap-2 p-3 bg-white rounded-md border border-gray-200"
                                                    >
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-gray-600">
                                                                진행시간
                                                            </Label>
                                                            <Select
                                                                value={priceOption.duration}
                                                                onValueChange={(value) =>
                                                                    updatePriceOption(
                                                                        option.id,
                                                                        priceOption.id,
                                                                        "duration",
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="시간 선택" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="30">30분</SelectItem>
                                                                    <SelectItem value="60">60분</SelectItem>
                                                                    <SelectItem value="90">90분</SelectItem>
                                                                    <SelectItem value="120">120분</SelectItem>
                                                                    <SelectItem value="180">180분</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-gray-600">
                                                                가격 (원)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={priceOption.price}
                                                                onChange={(e) =>
                                                                    updatePriceOption(
                                                                        option.id,
                                                                        priceOption.id,
                                                                        "price",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder="50000"
                                                                className="mb-0.5"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removePriceOption(option.id, priceOption.id)
                                                            }
                                                            className="mb-0.5"
                                                        >
                                                            <Trash2 className="size-4 text-gray-400" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 가능한 시간 설정 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="size-5" />
                        가능한 시간 설정
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <CalendarModule
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            renderDateContent={(date) => {
                                const dateKey = format(date, "yyyy-MM-dd");
                                // Filter from availableTimeList
                                const schedules = availableTimeList.filter(s => getDateFromISO(s.startTime) === dateKey);

                                if (schedules.length === 0) return null;
                                return (
                                    <div className="space-y-1">
                                        {schedules.slice(0, 2).map((schedule, idx) => (
                                            <div
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                            >
                                                {formatTimeRange(schedule)}
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
                                        {getSelectedDateSchedule().map((timeSlot, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md"
                                            >
                                                <span className="text-sm font-medium">
                                                    {formatTimeRange(timeSlot)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTimeSlot(timeSlot)}
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

                    {selectedDate && (
                        <div className="mt-6 pt-6 border-t">
                            <h4 className="font-medium mb-3">시간대 선택</h4>
                            <p className="text-sm text-gray-500 mb-4">
                                {selectingStartHour === null
                                    ? "시작 시간을 클릭하세요"
                                    : "종료 시간을 클릭하세요"}
                            </p>

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
                                                onClick={() => handleTimeBarClick(hour)}
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
                                                {hour % 3 === 0 && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

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
        </div>
    );
}
