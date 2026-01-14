
import { useState, useEffect } from "react";
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

export interface PriceOption {
    id: string;
    duration: string;
    price: string;
}

export interface ServiceOption {
    id: string;
    name: string;
    priceOptions: PriceOption[];
}

export interface AvailableTime {
    id: string;
    startTime: string;
    endTime: string;
}

export interface DaySchedule {
    [dateKey: string]: AvailableTime[];
}

export interface MentoringData {
    options: ServiceOption[];
    schedules: DaySchedule;
}

interface MentoringSectionProps {
    onChange: (data: MentoringData) => void;
}

export function MentoringSection({ onChange }: MentoringSectionProps) {
    // Mentoring Option State
    const [options, setOptions] = useState<ServiceOption[]>([
        { id: "1", name: "", priceOptions: [] },
    ]);

    // Schedule State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [daySchedules, setDaySchedules] = useState<DaySchedule>({});
    const [selectingStartHour, setSelectingStartHour] = useState<number | null>(null);

    // Update parent
    useEffect(() => {
        onChange({
            options,
            schedules: daySchedules
        });
    }, [options, daySchedules, onChange]);


    // --- Option Logic ---
    const addOption = () => {
        setOptions([
            ...options,
            { id: Date.now().toString(), name: "", priceOptions: [] },
        ]);
    };

    const removeOption = (id: string) => {
        if (options.length > 1) {
            setOptions(options.filter((option) => option.id !== id));
        }
    };

    const updateOptionName = (id: string, name: string) => {
        setOptions(
            options.map((option) =>
                option.id === id ? { ...option, name } : option,
            ),
        );
    };

    const addPriceOption = (optionId: string) => {
        setOptions(
            options.map((option) =>
                option.id === optionId
                    ? {
                        ...option,
                        priceOptions: [
                            ...option.priceOptions,
                            {
                                id: Date.now().toString(),
                                duration: "",
                                price: "",
                            },
                        ],
                    }
                    : option,
            ),
        );
    };

    const removePriceOption = (optionId: string, priceOptionId: string) => {
        setOptions(
            options.map((option) =>
                option.id === optionId
                    ? {
                        ...option,
                        priceOptions: option.priceOptions.filter(
                            (po) => po.id !== priceOptionId,
                        ),
                    }
                    : option,
            ),
        );
    };

    const updatePriceOption = (
        optionId: string,
        priceOptionId: string,
        field: keyof PriceOption,
        value: string,
    ) => {
        setOptions(
            options.map((option) =>
                option.id === optionId
                    ? {
                        ...option,
                        priceOptions: option.priceOptions.map((po) =>
                            po.id === priceOptionId
                                ? { ...po, [field]: value }
                                : po,
                        ),
                    }
                    : option,
            ),
        );
    };


    // --- Schedule Logic ---
    const getDateKey = (date: Date) => {
        return format(date, "yyyy-MM-dd");
    };

    const getSelectedDateSchedule = () => {
        if (!selectedDate) return [];
        return daySchedules[getDateKey(selectedDate)] || [];
    };

    const handleTimeBarClick = (hour: number) => {
        if (!selectedDate) return;

        if (selectingStartHour === null) {
            setSelectingStartHour(hour);
        } else {
            const startHour = Math.min(selectingStartHour, hour);
            const endHour = Math.max(selectingStartHour, hour) + 1;

            const dateKey = getDateKey(selectedDate);
            const newTimeSlot: AvailableTime = {
                id: Date.now().toString(),
                startTime: `${String(startHour).padStart(2, '0')}:00`,
                endTime: `${String(endHour).padStart(2, '0')}:00`,
            };

            setDaySchedules({
                ...daySchedules,
                [dateKey]: [...(daySchedules[dateKey] || []), newTimeSlot],
            });

            setSelectingStartHour(null);
        }
    };

    const removeTimeSlot = (timeId: string) => {
        if (!selectedDate) return;

        const dateKey = getDateKey(selectedDate);
        setDaySchedules({
            ...daySchedules,
            [dateKey]: daySchedules[dateKey].filter((t) => t.id !== timeId),
        });
    };

    const isHourInSchedule = (hour: number) => {
        const schedule = getSelectedDateSchedule();
        return schedule.some(slot => {
            const slotStart = parseInt(slot.startTime.split(':')[0]);
            const slotEnd = parseInt(slot.endTime.split(':')[0]);
            return hour >= slotStart && hour < slotEnd;
        });
    };

    const isHourInSelectingRange = (hour: number) => {
        if (selectingStartHour === null) return false;
        const min = Math.min(selectingStartHour, hour);
        const max = Math.max(selectingStartHour, hour);
        return hour >= min && hour <= max;
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
                            onClick={addOption}
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
                            {options.map((option, index) => (
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
                                                updateOptionName(option.id, e.target.value)
                                            }
                                            placeholder={`옵션 ${index + 1} (예: 기본 상담)`}
                                            className="flex-1 bg-white"
                                        />
                                        {options.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(option.id)}
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
                                                    onClick={() => removeTimeSlot(timeSlot.id)}
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
